import random
import uuid
from typing import List, Dict, Any, Optional

class MCQGenerator:
    """
    Multiple Choice Question (MCQ) & Smart Distractor Generation Engine.
    Generates 4-option certification-style questions with 1 correct answer
    and 3 plausible distractors and full explanations.
    """

    MCQ_TAXONOMY_TEMPLATES = {
        "Terraform": [
            {
                "question": "Which command is used to preview the execution changes that Terraform will perform?",
                "correct": "terraform plan",
                "distractors": ["terraform apply --dry-run", "terraform preview", "terraform validate --execute"],
                "explanation": "`terraform plan` creates an execution plan, letting you preview the infrastructure changes before applying."
            },
            {
                "question": "What is the primary function of the Terraform state file (`terraform.tfstate`)?",
                "correct": "Maps real-world resources to your configuration and tracks metadata",
                "distractors": [
                    "Compiles HCL code into binary machine code",
                    "Stores encrypted cloud provider secret access keys",
                    "Acts as a live load balancer for provisioned virtual machines"
                ],
                "explanation": "Terraform state stores the mapping between your declared configuration files and real-world provisioned resources."
            },
            {
                "question": "Which block in Terraform is used to configure plugins for cloud providers like AWS or Azure?",
                "correct": "provider",
                "distractors": ["resource", "module", "backend"],
                "explanation": "The `provider` block specifies and configures plugins required to interact with specific cloud APIs."
            }
        ],
        "AWS": [
            {
                "question": "Which AWS service provides serverless compute that executes code in response to triggers?",
                "correct": "AWS Lambda",
                "distractors": ["Amazon EC2", "Amazon ECS", "AWS Elastic Beanstalk"],
                "explanation": "AWS Lambda is a serverless compute service that runs code automatically in response to events without provisioning servers."
            },
            {
                "question": "Which Amazon S3 storage class is best suited for data accessed less frequently but requiring immediate retrieval?",
                "correct": "S3 Standard-Infrequent Access (S3 Standard-IA)",
                "distractors": [
                    "S3 Glacier Deep Archive",
                    "S3 Intelligent-Tiering Archive Instant",
                    "S3 One Zone-IA"
                ],
                "explanation": "S3 Standard-IA offers lower storage costs for infrequently accessed data with millisecond retrieval times across multiple AZs."
            },
            {
                "question": "What security mechanism acts as a virtual firewall at the subnet level in an Amazon VPC?",
                "correct": "Network Access Control List (NACL)",
                "distractors": ["Security Group", "AWS WAF", "Route Table"],
                "explanation": "NACLs are stateless firewalls that control traffic in and out of subnets, whereas Security Groups operate at the instance/ENI level."
            }
        ],
        "Docker": [
            {
                "question": "Which Docker instruction specifies the default command executed when a container starts?",
                "correct": "CMD",
                "distractors": ["RUN", "EXPOSE", "COPY"],
                "explanation": "`CMD` defines default arguments and commands for an executing container, whereas `RUN` executes commands during image build."
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
                "explanation": "A Pod encapsulates one or more co-located containers, shared storage, and unique IP address as the fundamental unit in Kubernetes."
            },
            {
                "question": "Which Kubernetes Service type exposes the service externally using a cloud provider's dedicated load balancer?",
                "correct": "LoadBalancer",
                "distractors": ["ClusterIP", "NodePort", "ExternalName"],
                "explanation": "`Type: LoadBalancer` automatically provisions an external cloud load balancer routing traffic to NodePorts and Pods."
            }
        ]
    }

    def generate_mcqs_for_subject(
        self,
        subject: str,
        topic: str = "",
        count: int = 5,
        rag_engine=None
    ) -> List[Dict[str, Any]]:
        """Generate a list of formatted 4-option MCQs with randomized option ordering."""
        mcqs = []
        matched_templates = []

        # Check matched taxonomy
        for subj_key, templates in self.MCQ_TAXONOMY_TEMPLATES.items():
            if subj_key.lower() in subject.lower() or subject.lower() in subj_key.lower():
                matched_templates.extend(templates)

        if not matched_templates:
            matched_templates = [item for sublist in self.MCQ_TAXONOMY_TEMPLATES.values() for item in sublist]

        # Use RAG grounding if available to find relevant questions
        if rag_engine and topic:
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

                    distractors = self._generate_generic_distractors(subject, correct_ans)
                    mcqs.append(self._format_mcq(q_text, correct_ans, distractors, r.get("answer", "")))

        # Fill remaining with curated templates
        sample_pool = list(matched_templates)
        random.shuffle(sample_pool)

        while len(mcqs) < count and sample_pool:
            tpl = sample_pool.pop()
            mcqs.append(self._format_mcq(tpl["question"], tpl["correct"], tpl["distractors"], tpl["explanation"]))

        # If still need more, generate dynamic questions
        while len(mcqs) < count:
            dyn_q = f"Which best describes the operational architecture of {topic or subject} in production?"
            correct = f"Provides automated scalability, high availability, and isolated state management for {topic or subject}"
            distractors = [
                f"Requires manual provisioning and runs as a single point of failure without backups",
                f"Executes only client-side within browser runtime without backend networking",
                f"Deprecated legacy protocol replaced by static configuration files"
            ]
            mcqs.append(self._format_mcq(dyn_q, correct, distractors, f"Standard cloud architecture principles for {topic or subject}."))

        return mcqs[:count]

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

    def _generate_generic_distractors(self, subject: str, correct: str) -> List[str]:
        """Generate 3 plausible distractors."""
        distractor_bank = [
            "Requires root privileges and disables network isolation by default",
            "Operates exclusively in local memory without persistent block storage",
            "Synchronizes state using unencrypted plain-text socket connections",
            "Is a deprecated legacy utility superseded by modern orchestration tools",
            "Only supports monolithic single-node deployments without failover"
        ]
        random.shuffle(distractor_bank)
        return distractor_bank[:3]
