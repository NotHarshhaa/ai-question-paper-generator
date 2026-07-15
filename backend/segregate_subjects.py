"""
segregate_subjects.py
----------------------
Reads backend/data/pyq_data.json (format: { "<source pdf>": [ {question, answer, source}, ... ] })
and classifies every question into a Subject bucket using smart keyword scoring.

Strategy:
1. Score each subject against the SOURCE FILENAME (high weight - filenames are curated/descriptive).
2. Score each subject against the QUESTION text (medium weight).
3. Score each subject against the ANSWER text (low weight, capped in length to avoid runaway matches
   on huge answer blobs).
4. Pick the subject with the highest combined score. Ties are broken by a priority order list
   (more specific subjects win over generic ones, e.g. "Terraform" beats "DevOps General").
5. Anything that scores 0 across all subjects falls into "General DevOps / Misc".

Output: backend/data/pyq_data_by_subject.json
Format: { "<Subject Name>": [ {question, answer, source}, ... ], ... }

Also writes a small summary report to stdout and backend/data/subject_summary.json
"""

import json
import re
from collections import defaultdict, Counter
from pathlib import Path

DATA_PATH = Path(__file__).parent / "data" / "pyq_data.json"
OUT_PATH = Path(__file__).parent / "data" / "pyq_data_by_subject.json"
SUMMARY_PATH = Path(__file__).parent / "data" / "subject_summary.json"

# ---------------------------------------------------------------------------
# Subject keyword definitions.
# Keys = subject display name.
# Values = dict of keyword -> weight (applied multiplicatively per match location).
# Order in this dict also acts as tie-break priority (earlier = more specific / higher priority)
# when scores are equal, EXCEPT we override tie-break explicitly via PRIORITY list below.
# ---------------------------------------------------------------------------

SUBJECT_KEYWORDS = {
    "Terraform": {
        "terraform": 10, "hcl": 6, "tfstate": 8, "tfvars": 6, ".tf file": 5,
        "terraform plan": 8, "terraform apply": 8, "terraform init": 8,
        "terraform destroy": 8, "terraform import": 8, "terraform taint": 8,
        "terraform workspace": 8, "state file": 4, "state locking": 6,
        "provisioner": 4, "backend config": 4, "sentinel": 5, "module registry": 5,
        "for_each": 4, "count meta-argument": 4, "resource block": 4,
    },
    "Kubernetes": {
        "kubernetes": 10, "k8s": 9, "kubectl": 9, "pod": 4, "kubelet": 8,
        "kube-proxy": 8, "kube-scheduler": 8, "etcd": 6, "statefulset": 8,
        "daemonset": 8, "replicaset": 8, "deployment": 3, "helm": 7,
        "ingress": 5, "namespace": 4, "configmap": 6, "persistent volume": 7,
        "pvc": 6, "hpa": 6, "horizontal pod autoscaler": 8, "cronjob": 6,
        "node affinity": 6, "taints and tolerations": 7, "kubeadm": 8,
        "minikube": 8, "kube-apiserver": 8, "control plane": 5,
        "network policy": 5, "service mesh": 5, "istio": 7, "crd": 5,
        "kustomize": 7, "argocd": 7, "eks": 5, "gke": 5, "aks": 5,
        "container orchestration": 6,
    },
    "Docker & Containers": {
        "docker": 10, "dockerfile": 9, "docker-compose": 9, "docker compose": 9,
        "container image": 6, "docker image": 8, "docker container": 8,
        "docker network": 7, "docker volume": 7, "containerd": 6,
        "docker swarm": 8, "multi-stage build": 6, "docker registry": 6,
        "dockerhub": 7, "image layer": 4, "cri-o": 6,
    },
    "AWS": {
        "aws": 10, "amazon web services": 10, "ec2": 8, "s3 bucket": 8,
        "s3": 6, "iam": 7, "vpc": 8, "lambda": 7, "cloudformation": 8,
        "cloudwatch": 7, "cloudtrail": 7, "rds": 7, "dynamodb": 8,
        "route53": 8, "route 53": 8, "elastic load balancer": 7, "elb": 6,
        "auto scaling": 5, "elastic beanstalk": 8, "ebs": 6, "efs": 6,
        "sqs": 7, "sns": 7, "cloudfront": 7, "eks": 3, "ecs": 6,
        "fargate": 6, "nat gateway": 6, "internet gateway": 6,
        "security group": 5, "elastic ip": 6, "amazon machine image": 6,
        "ami": 5, "kms": 6, "secrets manager": 6, "guardduty": 7,
        "aws organizations": 6, "cloudtrail": 6, "aws config": 6,
        "elastic kubernetes service": 5, "codepipeline": 7, "codebuild": 7,
        "codedeploy": 7, "codecommit": 7, "snowball": 7, "glacier": 6,
        "waf": 5, "shield": 5, "transit gateway": 6, "direct connect": 6,
    },
    "Azure": {
        "azure": 10, "azure sql": 8, "azure devops": 8, "azure vm": 8,
        "azure storage": 7, "azure key vault": 7, "azure ad": 7,
        "azure kubernetes service": 8, "aks": 4, "azure functions": 7,
        "azure blob": 7, "arm template": 7, "azure resource manager": 7,
        "azure monitor": 6, "azure sentinel": 6,
    },
    "Git & GitHub / GitLab": {
        "git ": 8, "github": 9, "gitlab": 9, "git rebase": 9, "git merge": 8,
        "git stash": 9, "git clone": 8, "git commit": 7, "git branch": 8,
        "pull request": 7, "merge conflict": 7, "git reflog": 9,
        "git cherry-pick": 9, "git bisect": 9, "gitops": 6, "git hook": 8,
        "gitflow": 8, "git worktree": 9, "detached head": 8,
        "gitlab ci": 8, "github actions": 8, "git submodule": 9,
        "version control": 4,
    },
    "Jenkins & CI/CD": {
        "jenkins": 10, "jenkinsfile": 9, "ci/cd pipeline": 6, "ci/cd": 5,
        "continuous integration": 5, "continuous delivery": 5,
        "continuous deployment": 5, "pipeline as code": 5,
        "blue ocean": 8, "declarative pipeline": 7, "scripted pipeline": 7,
        "codepipeline": 4, "circleci": 8, "travis ci": 8, "argocd": 4,
        "fluxcd": 8, "build agent": 5,
    },
    "Ansible & Configuration Management": {
        "ansible": 10, "playbook": 8, "chef": 7, "puppet": 7,
        "configuration management": 6, "idempotency": 4,
    },
    "Linux & Shell Scripting": {
        "linux": 9, "shell script": 8, "bash": 7, "systemctl": 8,
        "iptables": 7, "cron job": 6, "chmod": 8, "symlink": 7,
        "grep": 6, "sed": 5, "awk": 5, "lvm": 8, "runlevel": 8,
        "kernel panic": 8, "ssh": 5, "file permission": 5,
        "process management": 5, "systemd": 7,
    },
    "Networking": {
        "networking": 8, "tcp": 6, "udp": 6, "dns": 7, "subnet": 5,
        "cidr": 7, "firewall": 6, "load balancer": 5, "nat gateway": 3,
        "ip address": 5, "port": 3, "network policy": 3, "tls": 5,
        "ssl": 5, "https": 5, "http": 3, "vpc peering": 4,
        "network address translation": 6, "osi model": 7,
        "routing table": 6, "security group": 3, "nacl": 6,
    },
    "DevSecOps & Security": {
        "devsecops": 10, "sast": 7, "dast": 7, "owasp": 8,
        "vulnerability scanning": 6, "penetration test": 6, "trivy": 7,
        "sonarqube": 7, "vault": 5, "secrets management": 5,
        "rbac": 6, "zero trust": 6, "container security": 6,
        "compliance": 4, "encryption": 4, "iam policy": 3,
        "security policy": 3, "threat model": 6, "cis benchmark": 7,
    },
    "Monitoring & Logging": {
        "prometheus": 9, "grafana": 9, "elk stack": 8, "elasticsearch": 6,
        "logstash": 7, "kibana": 7, "fluentd": 7, "cloudwatch alarm": 4,
        "monitoring": 4, "observability": 5, "loki": 8, "log aggregation": 5,
        "alertmanager": 8, "jaeger": 7, "opentelemetry": 7,
    },
    "Cloud Computing General": {
        "cloud computing": 8, "iaas": 6, "paas": 6, "saas": 6,
        "public cloud": 5, "private cloud": 5, "hybrid cloud": 5,
        "multi-cloud": 5, "cloud service model": 4, "cloud migration": 5,
        "cloud native": 4,
    },
    "SonarQube & Code Quality": {
        "sonarqube": 8, "code smell": 7, "code coverage": 6,
        "static code analysis": 6, "quality gate": 7,
    },
}

# Priority order for tie-break (more specific subjects first).
PRIORITY_ORDER = [
    "Terraform",
    "Kubernetes",
    "Docker & Containers",
    "Ansible & Configuration Management",
    "Jenkins & CI/CD",
    "Git & GitHub / GitLab",
    "SonarQube & Code Quality",
    "DevSecOps & Security",
    "Monitoring & Logging",
    "AWS",
    "Azure",
    "Networking",
    "Linux & Shell Scripting",
    "Cloud Computing General",
    "General DevOps / Misc",
]

GENERAL_BUCKET = "General DevOps / Misc"


def score_text(text: str, keywords: dict) -> int:
    if not text:
        return 0
    text_lower = text.lower()
    score = 0
    for kw, weight in keywords.items():
        # count occurrences (cap at 3 to avoid one giant answer dominating)
        occurrences = min(text_lower.count(kw), 3)
        if occurrences:
            score += weight * occurrences
    return score


def classify(question: str, answer: str, source: str) -> str:
    # Cap answer length used for scoring to avoid runaway matches on huge blobs
    answer_snippet = (answer or "")[:1500]
    source_lower = (source or "").lower()

    scores = {}
    for subject, keywords in SUBJECT_KEYWORDS.items():
        s_score = score_text(source_lower, keywords) * 5   # filename weight multiplier
        q_score = score_text(question, keywords) * 2       # question weight multiplier
        a_score = score_text(answer_snippet, keywords) * 1 # answer weight multiplier
        scores[subject] = s_score + q_score + a_score

    max_score = max(scores.values())
    if max_score == 0:
        return GENERAL_BUCKET

    # collect all subjects achieving max score, break tie via PRIORITY_ORDER
    candidates = [s for s, v in scores.items() if v == max_score]
    if len(candidates) == 1:
        return candidates[0]

    for subj in PRIORITY_ORDER:
        if subj in candidates:
            return subj
    return candidates[0]


def main():
    if not DATA_PATH.exists():
        raise SystemExit(f"Input file not found: {DATA_PATH}")

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        raw = json.load(f)

    by_subject = defaultdict(list)
    total_questions = 0
    empty_question_skipped = 0
    per_source_subject_counter = Counter()

    for source_file, entries in raw.items():
        if not isinstance(entries, list):
            continue
        for entry in entries:
            question = (entry.get("question") or "").strip()
            answer = (entry.get("answer") or "").strip()
            source = entry.get("source") or source_file

            if not question:
                empty_question_skipped += 1
                continue

            subject = classify(question, answer, source)
            by_subject[subject].append({
                "question": question,
                "answer": answer,
                "source": source,
            })
            total_questions += 1
            per_source_subject_counter[(source_file, subject)] += 1

    # Sort subjects by PRIORITY_ORDER for readable output; unknown subjects appended at end
    ordered_output = {}
    for subj in PRIORITY_ORDER:
        if subj in by_subject:
            ordered_output[subj] = by_subject[subj]
    for subj in by_subject:
        if subj not in ordered_output:
            ordered_output[subj] = by_subject[subj]

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(ordered_output, f, indent=2, ensure_ascii=False)

    # Build summary
    summary = {
        "total_questions_processed": total_questions,
        "empty_question_skipped": empty_question_skipped,
        "subject_counts": {subj: len(qs) for subj, qs in ordered_output.items()},
        "source_files_processed": len(raw),
    }

    with open(SUMMARY_PATH, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print("=" * 60)
    print("SUBJECT SEGREGATION COMPLETE")
    print("=" * 60)
    print(f"Total source PDFs processed : {summary['source_files_processed']}")
    print(f"Total questions classified  : {summary['total_questions_processed']}")
    print(f"Skipped (empty question)    : {summary['empty_question_skipped']}")
    print("-" * 60)
    print(f"{'Subject':<40} {'Count':>10}")
    print("-" * 60)
    for subj, count in sorted(summary["subject_counts"].items(), key=lambda x: -x[1]):
        print(f"{subj:<40} {count:>10}")
    print("-" * 60)
    print(f"Output written to: {OUT_PATH}")
    print(f"Summary written to: {SUMMARY_PATH}")


if __name__ == "__main__":
    main()
