import random
import uuid
import logging
from typing import List, Dict, Any, Optional
from utils.llm_gateway import LLMGateway

logger = logging.getLogger(__name__)

class MCQGenerator:
    """
    Multiple Choice Question (MCQ) & Contextual Distractor Generation Engine.
    Generates 4-option certification-style questions with 1 correct answer,
    3 plausible distractors modeling real cloud engineering misconceptions, and explanations.
    Uses LLMGateway when online, and a curated multi-subject taxonomy bank when offline.
    """

    MCQ_TAXONOMY_TEMPLATES: Dict[str, List[Dict[str, Any]]] = {

        "Terraform": [
            {
                "question": "Which command is used to preview execution changes that Terraform will perform without altering infrastructure?",
                "correct": "terraform plan",
                "distractors": ["terraform apply --dry-run", "terraform preview", "terraform validate --execute"],
                "explanation": "`terraform plan` creates an execution plan, letting you preview the infrastructure changes before applying."
            },
            {
                "question": "What is the primary function of the Terraform state file (`terraform.tfstate`)?",
                "correct": "Maps declared configuration resources to real-world infrastructure and tracks metadata",
                "distractors": [
                    "Compiles HCL code into binary machine code",
                    "Stores encrypted cloud provider secret access keys",
                    "Acts as a live runtime load balancer for provisioned virtual machines"
                ],
                "explanation": "Terraform state stores the mapping between your declared configuration files and real-world provisioned resources."
            },
            {
                "question": "How does Terraform prevent two engineers from applying state changes concurrently?",
                "correct": "State locking using a backend like Amazon DynamoDB or Terraform Cloud",
                "distractors": [
                    "Git pre-commit hooks that reject merge requests",
                    "Local file permissions set to read-only during execution",
                    "Automatic rolling rollback triggered by CloudWatch"
                ],
                "explanation": "State locking prevents concurrent operations on the same state file using distributed locks via DynamoDB, Consul, or remote backends."
            }
        ],
        "AWS": [
            {
                "question": "Which AWS service provides serverless compute that executes code in response to events?",
                "correct": "AWS Lambda",
                "distractors": ["Amazon EC2", "Amazon ECS", "AWS Elastic Beanstalk"],
                "explanation": "AWS Lambda is an event-driven serverless compute service that runs code automatically without provisioning or managing servers."
            },
            {
                "question": "Which Amazon S3 storage class is best suited for data accessed less frequently but requiring millisecond retrieval times?",
                "correct": "S3 Standard-Infrequent Access (S3 Standard-IA)",
                "distractors": [
                    "S3 Glacier Deep Archive",
                    "S3 Glacier Flexible Retrieval",
                    "S3 One Zone-IA"
                ],
                "explanation": "S3 Standard-IA offers lower storage costs for infrequently accessed data with millisecond retrieval times across multiple AZs."
            },
            {
                "question": "What security mechanism acts as a stateless virtual firewall at the subnet level in an Amazon VPC?",
                "correct": "Network Access Control List (NACL)",
                "distractors": ["Security Group", "AWS WAF", "Route Table"],
                "explanation": "NACLs are stateless firewalls operating at the subnet boundary, whereas Security Groups are stateful and operate at the ENI level."
            },
            {
                "question": "Which AWS service enables decoupling of microservices via asynchronous message queuing with at-least-once delivery?",
                "correct": "Amazon Simple Queue Service (SQS)",
                "distractors": ["Amazon SNS", "Amazon Kinesis Data Streams", "Amazon EventBridge"],
                "explanation": "Amazon SQS is a distributed message queuing service providing message pulling and decoupled asynchronous processing."
            }
        ],
        "Docker": [
            {
                "question": "Which Dockerfile instruction specifies the default executable and parameters when a container starts?",
                "correct": "CMD",
                "distractors": ["RUN", "EXPOSE", "COPY"],
                "explanation": "`CMD` defines default arguments and commands for an executing container, whereas `RUN` executes commands during image build."
            },
            {
                "question": "What is the primary benefit of multi-stage Docker builds?",
                "correct": "Drastically reduces final image size by discarding build-time tools and intermediate layers",
                "distractors": [
                    "Allows a single container to run multiple operating systems concurrently",
                    "Enables live kernel patching without stopping containers",
                    "Automatically replicates containers across Kubernetes nodes"
                ],
                "explanation": "Multi-stage builds allow developers to use separate stages for compilation and runtime, creating minimal production images."
            },
            {
                "question": "How do you run a Docker container in the background (detached mode)?",
                "correct": "docker run -d <image_name>",
                "distractors": [
                    "docker run -b <image_name>",
                    "docker run --background <image_name>",
                    "docker start --daemon <image_name>"
                ],
                "explanation": "The `-d` or `--detach` flag instructs Docker to run the container in the background and print the container ID."
            }
        ],
        "Kubernetes": [
            {
                "question": "What is the smallest deployable computing unit that can be created and managed in Kubernetes?",
                "correct": "Pod",
                "distractors": ["Deployment", "Node", "Container"],
                "explanation": "A Pod encapsulates one or more co-located containers, shared storage, and unique network IP as the atomic unit in Kubernetes."
            },
            {
                "question": "Which Kubernetes Service type exposes the service externally using a cloud provider's native load balancer?",
                "correct": "LoadBalancer",
                "distractors": ["ClusterIP", "NodePort", "ExternalName"],
                "explanation": "`Type: LoadBalancer` automatically provisions an external cloud load balancer routing traffic to NodePorts and Pods."
            },
            {
                "question": "Which controller ensures that a specific number of pod replicas are running across your cluster at all times?",
                "correct": "ReplicaSet",
                "distractors": ["DaemonSet", "Job", "StatefulSet"],
                "explanation": "A ReplicaSet maintains a stable set of replica Pods running at any given time, typically managed by higher-level Deployments."
            },
            {
                "question": "Which Kubernetes object manages external HTTP/HTTPS routing into cluster services based on hostnames and paths?",
                "correct": "Ingress",
                "distractors": ["Egress Gateway", "NetworkPolicy", "ClusterIP"],
                "explanation": "Ingress exposes HTTP and HTTPS routes from outside the cluster to services within the cluster using an Ingress Controller."
            }
        ],
        "CI/CD": [
            {
                "question": "What is the primary goal of Continuous Integration (CI)?",
                "correct": "Automatically merge code changes into a shared branch and validate with automated builds and tests",
                "distractors": [
                    "Automatically deploy every commit directly to production without staging",
                    "Replace unit tests with manual user acceptance testing",
                    "Eliminate version control branches and work entirely on main"
                ],
                "explanation": "CI aims to detect integration issues early through automated build compilation and continuous testing on every commit."
            },
            {
                "question": "Which deployment strategy routes a small percentage of production traffic to a new version to verify stability before full rollout?",
                "correct": "Canary Deployment",
                "distractors": ["Blue/Green Deployment", "Recreate Deployment", "Rolling Update"],
                "explanation": "Canary deployments gradually shift traffic (e.g. 5% -> 25% -> 100%) to a subset of users to test for regressions in production."
            }
        ],
        "Ansible": [
            {
                "question": "What property of Ansible tasks guarantees that executing a playbook multiple times produces the exact same system state?",
                "correct": "Idempotence",
                "distractors": ["Concurrency", "Atomicity", "Immutability"],
                "explanation": "Idempotence ensures that an Ansible module only performs changes if the system is not already in the desired target state."
            }
        ],
        "Linux": [
            {
                "question": "Which Linux signal code is sent by `kill -9 <PID>` to immediately terminate a process without allowing cleanup?",
                "correct": "SIGKILL",
                "distractors": ["SIGTERM", "SIGINT", "SIGHUP"],
                "explanation": "SIGKILL (signal 9) forces immediate process termination at the kernel level and cannot be caught, blocked, or handled by the process."
            }
        ]
    }

    def __init__(self, llm_gateway: Optional[LLMGateway] = None):
        self.llm_gateway = llm_gateway or LLMGateway()

    def generate_mcqs_for_subject(
        self,
        subject: str,
        topic: str = "",
        count: int = 5,
        rag_engine=None
    ) -> List[Dict[str, Any]]:
        """Generate a list of formatted 4-option MCQs with randomized option ordering."""
        # 1. Try LLM generation if available
        if self.llm_gateway and self.llm_gateway.is_available():
            grounding = ""
            if rag_engine and topic:
                try:
                    grounding = rag_engine.get_grounding_context(topic, subject=subject, top_k=2)
                except Exception:
                    pass

            llm_mcqs = self._generate_with_llm(subject, topic, count, grounding)
            if llm_mcqs and len(llm_mcqs) >= count:
                return llm_mcqs[:count]

        # 2. Offline fallback: Match curated taxonomy templates
        mcqs = []
        matched_templates = []

        for subj_key, templates in self.MCQ_TAXONOMY_TEMPLATES.items():
            if subj_key.lower() in subject.lower() or subject.lower() in subj_key.lower():
                matched_templates.extend(templates)

        if not matched_templates:
            matched_templates = [item for sublist in self.MCQ_TAXONOMY_TEMPLATES.values() for item in sublist]

        # Use RAG grounding if available to find relevant questions from PYQs
        if rag_engine and topic:
            try:
                rag_results = rag_engine.search(f"{subject} {topic}", top_k=count)
                for r in rag_results:
                    if len(r.get("text", "")) > 15 and len(r.get("answer", "")) > 20:
                        q_text = r["text"]
                        if not q_text.endswith("?"):
                            q_text += "?"
                        correct_ans = r["answer"].split("\n")[0].strip()
                        if correct_ans.startswith("o "):
                            correct_ans = correct_ans[2:]
                        if len(correct_ans) > 100:
                            correct_ans = correct_ans[:90] + "..."

                        distractors = self._generate_contextual_distractors(subject, correct_ans)
                        mcqs.append(self._format_mcq(q_text, correct_ans, distractors, r.get("answer", "")))
                        if len(mcqs) >= count:
                            return mcqs[:count]
            except Exception:
                pass

        # Fill remaining with curated templates
        sample_pool = list(matched_templates)
        random.shuffle(sample_pool)

        while len(mcqs) < count and sample_pool:
            tpl = sample_pool.pop()
            mcqs.append(
                self._format_mcq(
                    str(tpl["question"]),
                    str(tpl["correct"]),
                    list(tpl["distractors"]),
                    str(tpl["explanation"]),
                )
            )


        # If still need more, generate dynamic domain questions
        while len(mcqs) < count:
            dyn_q = f"Which statement accurately describes the production architecture and operational model of {topic or subject}?"
            correct = f"Provides automated horizontal scaling, declarative state management, and isolated failure domains for {topic or subject}"
            distractors = [
                f"Requires manual provisioning with synchronous single-thread processing and no automated health checks",
                f"Stores all persistent state entirely inside volatile client browser cache without server synchronization",
                f"Deprecated monolith architecture superseded by unmanaged cron scripts"
            ]
            mcqs.append(self._format_mcq(dyn_q, correct, distractors, f"Standard cloud reliability and operational resilience principles for {topic or subject}."))

        return mcqs[:count]

    def _generate_with_llm(
        self, subject: str, topic: str, count: int, grounding_context: str = ""
    ) -> Optional[List[Dict[str, Any]]]:
        """Generate high-quality certification MCQs with realistic distractors using LLM."""
        system_prompt = (
            "You are a senior exam designer for AWS and DevOps certifications (AWS SAA, CKA, HashiCorp Terraform).\n"
            "Create authentic, challenging multiple-choice questions (MCQs).\n"
            "Each question MUST have 4 options: exactly 1 correct answer and 3 plausible distractors that target realistic engineer misconceptions.\n"
            "Return a JSON array of objects with the following schema:\n"
            "[\n"
            "  {\n"
            "    \"question\": \"Question text?\",\n"
            "    \"correct\": \"Correct option text\",\n"
            "    \"distractors\": [\"Distractor 1\", \"Distractor 2\", \"Distractor 3\"],\n"
            "    \"explanation\": \"Clear technical explanation detailing why the correct answer is right and why the distractors are incorrect.\",\n"
            "    \"difficulty\": \"medium\"\n"
            "  }\n"
            "]"
        )

        user_prompt = (
            f"Subject: {subject}\n"
            f"Topic: {topic or 'Cloud & DevOps Architecture'}\n"
            f"Number of MCQs: {count}\n"
        )
        if grounding_context:
            user_prompt += f"Grounding PYQ Context:\n{grounding_context}\n"

        result = self.llm_gateway.generate_json(system_prompt, user_prompt, temperature=0.6)
        if isinstance(result, list) and len(result) > 0:
            formatted = []
            for item in result:
                if isinstance(item, dict) and item.get("question") and item.get("correct") and item.get("distractors"):
                    distractors = item["distractors"]
                    if isinstance(distractors, list) and len(distractors) >= 3:
                        formatted.append(
                            self._format_mcq(
                                item["question"],
                                item["correct"],
                                distractors[:3],
                                item.get("explanation", "Verified certification exam solution.")
                            )
                        )
            if formatted:
                return formatted
        return None

    def _format_mcq(self, question: str, correct: str, distractors: List[str], explanation: str) -> Dict[str, Any]:
        """Combine correct option with distractors and shuffle."""
        options = [correct] + distractors[:3]
        random.shuffle(options)
        correct_index = options.index(correct)
        option_letters = ["A", "B", "C", "D"]

        return {
            "id": str(uuid.uuid4()),
            "question": question,
            "options": options,
            "correct_option_index": correct_index,
            "correct_option_letter": option_letters[correct_index],
            "correct_answer": correct,
            "explanation": explanation,
            "marks": 2,
            "difficulty": "medium",
            "question_type": "mcq"
        }

    def _generate_contextual_distractors(self, subject: str, correct: str) -> List[str]:
        """Generate plausible fallback distractors based on subject domain."""
        subj_lower = subject.lower()
        if "aws" in subj_lower or "cloud" in subj_lower:
            bank = [
                "Utilizes S3 Glacier Flexible Retrieval with a mandatory 3-to-5 hour retrieval window",
                "Restricts traffic using security group ingress rules evaluated statelessly across subnets",
                "Requires cross-region VPC peering with active NAT Gateways deployed in private subnets",
                "Uses an Application Load Balancer configured for layer 4 TCP passthrough without SSL termination"
            ]
        elif "k8s" in subj_lower or "kubernetes" in subj_lower or "docker" in subj_lower:
            bank = [
                "Configures a ClusterIP service with hostPort binding bypassing kube-proxy iptables rules",
                "Binds the container directly to the host network namespace without cgroups resource limits",
                "Uses a DaemonSet to ensure exactly one replica runs per namespace across the cluster",
                "Mounts an emptyDir volume that persists data across pod deletions and cluster restarts"
            ]
        elif "terraform" in subj_lower or "iac" in subj_lower:
            bank = [
                "Executes `terraform refresh` to automatically reconcile drifting resources and apply diffs",
                "Uses `local-exec` provisioners to establish remote SSH tunnels directly to private nodes",
                "Requires committing the unencrypted `.terraform/terraform.tfstate` file to version control"
            ]
        else:
            bank = [
                "Enforces manual synchronous execution without automated retry policies or dead-letter queues",
                "Relies on unencrypted transport layers without mutual TLS or certificate verification",
                "Operates as a single-node stateful process without automated multi-zone failover"
            ]

        random.shuffle(bank)
        return bank[:3]
