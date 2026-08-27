"""
Intelligent Model Solution & Answer Key Generator for Generated Exam Papers.
Retrieves authentic answers from the PYQ database or generates topic-specific,
marks-calibrated model answers with concrete architecture, commands, and grading rubrics.
"""

import re
from typing import Dict, Any, List, Optional

# Rich technical knowledge base for major DevOps, AWS, and Cloud modules
TOPIC_KNOWLEDGE: Dict[str, Dict[str, Any]] = {
    "free tier": {
        "title": "AWS Free Tier & Pricing Models",
        "short_answer": (
            "AWS Free Tier provides hands-on access to over 100 AWS services across three tiers:\n"
            "1. Always Free: Never expires (e.g., AWS Lambda 1M requests/mo, Amazon DynamoDB 25GB storage).\n"
            "2. 12 Months Free: Available for 12 months from account creation (e.g., Amazon EC2 750 hrs/mo t2/t3.micro, Amazon S3 5GB standard storage).\n"
            "3. Short-Term Trials: Free trial periods beginning upon service activation.\n"
            "AWS Pricing Models include On-Demand (pay-as-you-go, no commitment), Savings Plans (up to 72% discount for 1/3-year commit), Reserved Instances (steady-state workloads), and Spot Instances (up to 90% discount on spare EC2 capacity)."
        ),
        "long_answer": (
            "### 1. AWS Free Tier Structure & Categories\n"
            "The AWS Free Tier offers three primary types of offerings to help customers explore cloud services:\n"
            "• Always Free: Ongoing free quotas that never expire (e.g., 1M AWS Lambda requests/month, 25 GB DynamoDB storage, 10 Amazon CloudWatch custom metrics and alarms).\n"
            "• 12 Months Free: Available for the first year post account registration (e.g., 750 hours/month of Linux/Windows t2.micro or t3.micro EC2 instances, 5 GB of standard Amazon S3 object storage, 750 hours of RDS db.t2/t3.micro).\n"
            "• Short-Term Trials: Service-specific trials initiated upon activation (e.g., Amazon SageMaker, Amazon Redshift, Amazon GuardDuty).\n\n"
            "### 2. AWS Compute & Storage Pricing Models\n"
            "AWS provides multiple pricing mechanisms tailored to differing workload predictability and risk profiles:\n"
            "1. On-Demand Instances: Pay by the second with zero upfront commitment; ideal for unpredictable, spiky workloads or initial testing.\n"
            "2. Savings Plans: Flexible discount model offering up to 72% savings in exchange for a committed usage (e.g., $10/hour for 1 or 3 years) across EC2, Fargate, and Lambda.\n"
            "3. Reserved Instances (RIs): Up to 72% discount for standard steady-state applications with fixed instance types and AZ commitments (Standard vs Convertible RIs).\n"
            "4. Spot Instances: Up to 90% savings utilizing spare AWS compute capacity; subject to a 2-minute termination notice, making it suitable for stateless, fault-tolerant batch workloads.\n"
            "5. Dedicated Hosts & Instances: Physical servers dedicated to a single customer for regulatory compliance or server-bound software licensing (BYOL).\n\n"
            "### 3. Cost Management & Governance Best Practices\n"
            "• AWS Budgets & Cost Explorer: Configure custom cost thresholds and automated email/SNS alerts.\n"
            "• AWS Cost Anomaly Detection: Machine learning driven detection of unexpected spending spikes.\n"
            "• Auto-Shutdown Automation: Lambda and EventBridge schedules to stop non-production instances during off-hours."
        ),
        "short_rubric": [
            "Definition of 3 Free Tier tiers (Always Free, 12 Months, Trials) — 1 Mark",
            "Overview of 4 core pricing models (On-Demand, Reserved, Savings Plans, Spot) — 1 Mark"
        ],
        "long_rubric": [
            "Explanation of Free Tier categories and concrete quota limits (Always Free, 12-Month, Trials) — 5 Marks",
            "In-depth comparison of Pricing Models (On-Demand, Savings Plans, Reserved, Spot, Dedicated) — 5 Marks",
            "Cost optimization tools & operational governance (AWS Budgets, Cost Explorer, Tagging) — 5 Marks"
        ]
    },
    "iaas": {
        "title": "Cloud Computing Models (IaaS, PaaS, SaaS)",
        "short_answer": (
            "Cloud Computing Service Models categorize the level of abstraction and management responsibility:\n"
            "• IaaS (Infrastructure as a Service): Provides raw compute, storage, and networking resources (e.g., Amazon EC2, Azure VMs). The user manages OS, runtime, and applications; the cloud provider manages physical hardware, virtualization, and datacenters.\n"
            "• PaaS (Platform as a Service): Provides a managed platform for application development without managing underlying OS/servers (e.g., AWS Elastic Beanstalk, Heroku).\n"
            "• SaaS (Software as a Service): End-user applications hosted and managed entirely by the provider (e.g., Google Workspace, Office 365)."
        ),
        "long_answer": (
            "### 1. Overview of Cloud Service Models (The SPI Model)\n"
            "Cloud service delivery is organized hierarchically based on the division of operational responsibility:\n\n"
            "1. Infrastructure as a Service (IaaS):\n"
            "   - Definition: Delivers fundamental computing resources (virtual servers, block storage, firewalls, routing) over the internet.\n"
            "   - Customer Responsibility: Operating system selection, patching, middleware, runtime environment, data security, network access controls, and application logic.\n"
            "   - Provider Responsibility: Datacenter physical security, power, cooling, physical servers, storage arrays, and hypervisor virtualization.\n"
            "   - Examples: Amazon EC2, Amazon EBS, Google Compute Engine, Microsoft Azure Virtual Machines.\n\n"
            "2. Platform as a Service (PaaS):\n"
            "   - Definition: Provides pre-configured development environments and runtimes allowing developers to deploy code without infrastructure maintenance.\n"
            "   - Customer Responsibility: Application source code, application configuration, and database schemas.\n"
            "   - Provider Responsibility: OS maintenance, automatic scaling, load balancing, runtime patching, and hardware provisioning.\n"
            "   - Examples: AWS Elastic Beanstalk, Google App Engine, Heroku, Azure App Service.\n\n"
            "3. Software as a Service (SaaS):\n"
            "   - Definition: Completely managed software delivered to end-users via web browsers or APIs.\n"
            "   - Customer Responsibility: User account access, data entry, and organizational settings.\n"
            "   - Provider Responsibility: Full application lifecycle, uptime, backups, data redundancy, and security.\n"
            "   - Examples: Microsoft 365, Salesforce, Dropbox, Slack, Zoom.\n\n"
            "### 2. Cloud Deployment Models\n"
            "• Public Cloud: Multi-tenant infrastructure operated by third-party providers accessible over the public internet.\n"
            "• Private Cloud: Infrastructure provisioned exclusively for a single organization (on-premise or hosted).\n"
            "• Hybrid Cloud: Interconnected public and private cloud environments sharing data and applications via VPN or AWS Direct Connect."
        ),
        "short_rubric": [
            "Clear definition and distinction of IaaS, PaaS, and SaaS — 1 Mark",
            "Shared responsibility and real-world examples for each model — 1 Mark"
        ],
        "long_rubric": [
            "Comprehensive breakdown of IaaS, PaaS, SaaS with architectural layers — 5 Marks",
            "Detailed Shared Responsibility Model matrix for each service layer — 5 Marks",
            "Cloud Deployment Models (Public, Private, Hybrid) and practical selection criteria — 5 Marks"
        ]
    },
    "ec2": {
        "title": "Amazon EC2 & Auto Scaling",
        "short_answer": (
            "Amazon Elastic Compute Cloud (EC2) provides scalable virtual servers (instances) in the cloud.\n"
            "• Core Components: Amazon Machine Images (AMIs), Instance Types (General Purpose, Compute, Memory, Storage Optimized), Elastic Block Store (EBS), and Security Groups.\n"
            "• Auto Scaling Groups (ASG): Automatically adjusts the number of EC2 instances to maintain performance and optimize cost based on demand.\n"
            "• Scaling Policies: Target Tracking (maintains metric e.g., 60% CPU), Step Scaling, and Scheduled Scaling."
        ),
        "long_answer": (
            "### 1. Amazon EC2 Architecture & Key Components\n"
            "Amazon EC2 enables resizable compute capacity in AWS datacenters worldwide:\n"
            "• AMIs (Amazon Machine Images): Pre-configured templates containing the operating system, server software, and launch permissions.\n"
            "• Instance Families: Categorized by resource ratios — General Purpose (t4g, m6g), Compute Optimized (c6g), Memory Optimized (r6g), Storage Optimized (i3en), and Accelerated Computing (p4/g5 with GPUs).\n"
            "• Storage Options: EBS (persistent block storage with gp3, io2 types), Instance Store (ephemeral NVMe storage for temporary caches), and EFS (shared NFS filesystem).\n"
            "• Security: Virtual stateful firewalls (Security Groups) controlling inbound/outbound TCP/UDP ports, combined with IAM Instance Profiles for credential-free AWS API access.\n\n"
            "### 2. Amazon EC2 Auto Scaling Architecture\n"
            "Auto Scaling Groups (ASG) ensure high availability and elastic fault tolerance:\n"
            "• Launch Templates: Define instance configuration (AMI, instance type, key pair, user data bootstrap script, security groups, IAM role).\n"
            "• Capacity Configuration: Defined by Minimum Size, Maximum Size, and Desired Capacity across multiple Availability Zones.\n"
            "• Health Checks: Automatically replaces unhealthy instances via EC2 status checks or Application Load Balancer (ALB) health probes.\n\n"
            "### 3. Scaling Policies & Best Practices\n"
            "1. Target Tracking Policy: Automatically scales capacity to maintain a specific metric target (e.g., Average CPU Utilization at 50% or ALB Request Count Per Target).\n"
            "2. Step Scaling: Increases or decreases capacity in stepped increments based on CloudWatch alarm thresholds.\n"
            "3. Predictive Scaling: Machine learning algorithms analyze historical usage trends to proactively schedule capacity ahead of predicted traffic spikes.\n"
            "4. Multi-AZ Deployment: Distribute instances evenly across 3+ Availability Zones behind an Application Load Balancer for 99.99% fault tolerance."
        ),
        "short_rubric": [
            "Definition of Amazon EC2, AMIs, and instance types — 1 Mark",
            "Auto Scaling Group concepts and scaling policies — 1 Mark"
        ],
        "long_rubric": [
            "In-depth explanation of EC2 components, storage (EBS/Instance Store), and security — 5 Marks",
            "Auto Scaling Group architecture, Launch Templates, and lifecycle hooks — 5 Marks",
            "Scaling policies (Target Tracking, Step, Predictive) and Multi-AZ Load Balancing — 5 Marks"
        ]
    },
    "s3": {
        "title": "Amazon S3 & Storage Classes",
        "short_answer": (
            "Amazon Simple Storage Service (S3) is an object storage service offering 99.999999999% (11 9s) data durability.\n"
            "• Key S3 Storage Classes: S3 Standard (frequently accessed data), S3 Intelligent-Tiering (automatic cost optimization without retrieval fees), S3 Standard-IA (infrequent access), S3 One Zone-IA, S3 Glacier Instant Retrieval, S3 Glacier Flexible Retrieval, and S3 Glacier Deep Archive (lowest cost long-term archival).\n"
            "• Features: Lifecycle Policies (automated tier transitions), Versioning, S3 Replication (CRR/SRR), Bucket Policies, and KMS encryption."
        ),
        "long_answer": (
            "### 1. Amazon S3 Object Storage Fundamentals\n"
            "Amazon S3 stores data as objects within buckets. Each object consists of data, a unique Key, Metadata, Version ID, and Access Control policies.\n"
            "• Durability & Availability: Designed for 11 9s (99.999999999%) durability by automatically replicating data across a minimum of 3 Availability Zones (except One Zone-IA).\n\n"
            "### 2. S3 Storage Classes & Cost Optimization Matrix\n"
            "1. S3 Standard: High throughput, low latency for active, frequently accessed data (websites, cloud applications).\n"
            "2. S3 Intelligent-Tiering: Automatically moves objects between 3 access tiers (Frequent, Infrequent, Archive Instant) based on changing access patterns with zero operational overhead and no retrieval fees.\n"
            "3. S3 Standard-IA (Infrequent Access): Lower storage cost for long-lived data accessed less frequently, but with per-GB retrieval fees.\n"
            "4. S3 One Zone-IA: 20% cheaper than Standard-IA; stores data in a single AZ (suitable for non-critical, reproducible backups).\n"
            "5. S3 Glacier Instant Retrieval: Sub-second retrieval for archive data accessed once per quarter.\n"
            "6. S3 Glacier Flexible Retrieval: Archives retrievable from 1 minute to 5 hours (bulk/standard/expedited).\n"
            "7. S3 Glacier Deep Archive: Lowest cost storage in the cloud ($0.00099/GB/mo) for 7-10 year compliance records with 12-48 hour retrieval.\n\n"
            "### 3. S3 Lifecycle Management & Security\n"
            "• S3 Lifecycle Rules: Declarative rules to transition objects to cheaper storage classes after X days and expire/delete after Y days.\n"
            "• Security & Compliance: Server-Side Encryption (SSE-S3, SSE-KMS, SSE-C), Bucket Policies, S3 Block Public Access (enabled by default), S3 Object Lock for WORM (Write Once Read Many) regulatory compliance."
        ),
        "short_rubric": [
            "Explanation of S3 object storage, buckets, and 11 9s durability — 1 Mark",
            "Comparison of S3 Standard, Intelligent-Tiering, Standard-IA, and Glacier classes — 1 Mark"
        ],
        "long_rubric": [
            "Comprehensive breakdown of all S3 storage classes, access patterns, and cost trade-offs — 5 Marks",
            "S3 Lifecycle Management configuration, automated tiering, and expiration rules — 5 Marks",
            "Security mechanisms (Bucket policies, IAM, KMS encryption, Block Public Access, Object Lock) — 5 Marks"
        ]
    },
    "vpc": {
        "title": "Amazon VPC & Networking Basics",
        "short_answer": (
            "Amazon Virtual Private Cloud (VPC) provides an isolated virtual network in the AWS cloud.\n"
            "• Core Components: IPv4/IPv6 CIDR blocks (e.g., 10.0.0.0/16), Subnets (Public vs Private), Internet Gateway (IGW) for internet ingress/egress, NAT Gateway (enables outbound internet for private subnets), Route Tables, Security Groups (stateful firewall at instance level), and Network ACLs (stateless firewall at subnet level)."
        ),
        "long_answer": (
            "### 1. Amazon VPC Architecture & IP Addressing\n"
            "Amazon VPC allows organizations to define a logically isolated virtual topology:\n"
            "• CIDR Block: Primary private IP range (e.g., 10.0.0.0/16 providing 65,536 private IP addresses).\n"
            "• Subnets: Segments of the VPC IP range bound to a single Availability Zone:\n"
            "  - Public Subnets: Associated with a Route Table containing a route to an Internet Gateway (`0.0.0.0/0 -> igw-xxxx`).\n"
            "  - Private Subnets: No direct internet route; outbound internet traffic routed via a NAT Gateway (`0.0.0.0/0 -> nat-xxxx`).\n"
            "• Reserved IPs: AWS reserves 5 IP addresses in every subnet (Network address, VPC router, DNS, Future use, Broadcast).\n\n"
            "### 2. VPC Routing, Gateways & Endpoints\n"
            "• Internet Gateway (IGW): Horizontally scaled, highly available gateway attached to VPC for bidirectional public internet communication.\n"
            "• NAT Gateway: Managed AWS service deployed in a public subnet with an Elastic IP; allows private instances to pull updates/packages without exposing inbound ports.\n"
            "• VPC Peering: Direct network connection between two VPCs routing traffic via private IP addresses without internet traversal.\n"
            "• VPC Endpoints (PrivateLink): Securely connects VPC resources to AWS services (S3, DynamoDB) privately without NAT gateways or IGWs.\n\n"
            "### 3. Layered Security: Security Groups vs Network ACLs\n"
            "1. Security Groups (Stateful):\n"
            "   - Applied at the Elastic Network Interface (ENI) / Instance level.\n"
            "   - Supports ALLOW rules only; all rules evaluated before permitting traffic.\n"
            "   - Return traffic is automatically allowed regardless of inbound/outbound rules.\n"
            "2. Network Access Control Lists (NACLs) (Stateless):\n"
            "   - Applied at the Subnet boundary level.\n"
            "   - Supports both ALLOW and DENY rules, evaluated in numerical rule order.\n"
            "   - Inbound and outbound traffic must be explicitly permitted."
        ),
        "short_rubric": [
            "VPC concept, CIDR blocks, and public vs private subnets — 1 Mark",
            "Internet Gateway, NAT Gateway, and Security Groups vs NACLs — 1 Mark"
        ],
        "long_rubric": [
            "Detailed architectural diagram & explanation of VPC, Subnets, and IP allocation — 5 Marks",
            "Routing components (Route Tables, Internet Gateway, NAT Gateway, VPC Endpoints) — 5 Marks",
            "Comprehensive comparison of Security Groups vs NACLs with stateful/stateless mechanics — 5 Marks"
        ]
    },
    "regions": {
        "title": "AWS Global Infrastructure (Regions, AZs, Edge Locations)",
        "short_answer": (
            "AWS Global Infrastructure is organized into:\n"
            "• AWS Regions: Physical geographic locations around the world containing multiple isolated datacenters (e.g., us-east-1, eu-west-1).\n"
            "• Availability Zones (AZs): One or more discrete physical datacenters with redundant power, networking, and connectivity within a Region, connected via low-latency fiber links.\n"
            "• Edge Locations / CloudFront PoPs: Global network of 450+ Points of Presence used by Amazon CloudFront and AWS Global Accelerator to cache static and dynamic content close to users for low latency."
        ),
        "long_answer": (
            "### 1. AWS Global Infrastructure Hierarchy\n"
            "AWS operates a purpose-built global network infrastructure designed for extreme fault tolerance and high throughput:\n\n"
            "1. AWS Regions:\n"
            "   - A distinct physical geographical location worldwide (e.g., US East (N. Virginia), Asia Pacific (Tokyo)).\n"
            "   - Every Region is completely independent and autonomous to provide data sovereignty and disaster isolation.\n"
            "   - Selection Criteria: Compliance/Data Residency regulations, Proximity to end-users (latency), Service availability, and Regional pricing differences.\n\n"
            "2. Availability Zones (AZs):\n"
            "   - Every AWS Region consists of a minimum of 3 independent Availability Zones (e.g., us-east-1a, us-east-1b, us-east-1c).\n"
            "   - Each AZ contains one or more physical datacenters equipped with independent power substations, cooling, backup generators, and network carriers.\n"
            "   - Inter-AZ connections are powered by ultra-low-latency private fiber optic backbones (sub-2ms roundtrip).\n\n"
            "3. Edge Locations & Points of Presence (PoPs):\n"
            "   - 450+ Edge Locations distributed in major metropolitan cities across 90+ countries.\n"
            "   - Power Amazon CloudFront (Content Delivery Network), AWS Lambda@Edge, Amazon Route 53 (Anycast DNS), and AWS Shield (DDoS protection).\n\n"
            "### 2. High Availability & Multi-Region Disaster Recovery Patterns\n"
            "• Multi-AZ Deployment: Protects against localized datacenter failures (RPO=0, RTO in seconds).\n"
            "• Multi-Region Active-Active: Uses Route 53 Latency-based or Geolocation routing with DynamoDB Global Tables and S3 Cross-Region Replication for global 99.999% uptime."
        ),
        "short_rubric": [
            "Definition of Regions and Availability Zones — 1 Mark",
            "Edge Locations, Points of Presence, and CloudFront caching — 1 Mark"
        ],
        "long_rubric": [
            "In-depth explanation of Regions, AZ design, isolation, and selection criteria — 5 Marks",
            "Edge Locations, Points of Presence, and CDN acceleration mechanics — 5 Marks",
            "Multi-AZ vs Multi-Region architecture strategies for High Availability & Disaster Recovery — 5 Marks"
        ]
    },
    "docker": {
        "title": "Docker & Containerization",
        "short_answer": (
            "Docker is an open-source platform that packages applications and their dependencies into lightweight, standalone containers.\n"
            "• Core Components: Dockerfile (declarative instructions to build an image), Docker Image (immutable blueprint), Docker Container (running instance of an image), Docker Engine (daemon/runtime), and Docker Hub/ECR (container registry).\n"
            "• Key Commands: `docker build -t app:v1 .`, `docker run -d -p 80:80 app:v1`, `docker ps`, `docker logs`."
        ),
        "long_answer": (
            "### 1. Containerization vs Virtual Machines\n"
            "Containers virtualize at the Operating System kernel level, sharing the host OS kernel across containers, whereas Virtual Machines virtualize at the hardware level using a Hypervisor with full guest operating systems. Containers provide faster startup (milliseconds vs minutes), significantly smaller image footprint (megabytes vs gigabytes), and maximum resource density.\n\n"
            "### 2. Docker Architecture & Core Components\n"
            "• Dockerfile: Text configuration file defining the build process (FROM, WORKDIR, COPY, RUN, EXPOSE, ENV, CMD vs ENTRYPOINT).\n"
            "• Docker Image: Read-only layered filesystem built using UnionFS (Union File System), where each instruction creates an immutable cached layer.\n"
            "• Docker Container: Ephemeral, isolated process with a thin read-write container layer on top of base image layers.\n"
            "• Docker Daemon (dockerd): Background service managing images, containers, networks, and storage volumes via the Docker Engine REST API.\n\n"
            "### 3. Docker Storage, Networking & Multi-Stage Builds\n"
            "• Storage Mechanisms: Bind Mounts (direct host path mapping) and Docker Volumes (managed by Docker inside `/var/lib/docker/volumes` for persistent state).\n"
            "• Networking Drivers: bridge (default private internal network), host (removes isolation, uses host network stack), overlay (multi-host swarm networking), and none.\n"
            "• Multi-Stage Builds: Best practice using multiple `FROM` statements to compile binaries in an SDK builder stage and copy only production artifacts to a minimal Alpine/Distroless image for security and size reduction."
        ),
        "short_rubric": [
            "Definition of Docker, container vs VM, and Dockerfile/Image/Container — 1 Mark",
            "Core CLI commands and container registry workflow — 1 Mark"
        ],
        "long_rubric": [
            "Architectural comparison of Containers vs Hypervisor VMs — 5 Marks",
            "Deep dive into Docker Engine, UnionFS layered filesystem, and Dockerfile instructions — 5 Marks",
            "Storage volumes, networking drivers, and multi-stage build optimization — 5 Marks"
        ]
    },
    "kubernetes": {
        "title": "Kubernetes & Container Orchestration",
        "short_answer": (
            "Kubernetes (K8s) is an open-source container orchestration engine that automates deployment, scaling, and management of containerized applications.\n"
            "• Control Plane: kube-apiserver, etcd (distributed key-value store), kube-scheduler, kube-controller-manager.\n"
            "• Worker Node: kubelet (node agent), kube-proxy (network rules), container runtime (containerd).\n"
            "• Workload Objects: Pods (smallest deployable unit), Deployments (declarative rolling updates), ReplicaSets, Services (ClusterIP, NodePort, LoadBalancer), and Ingress."
        ),
        "long_answer": (
            "### 1. Kubernetes Architecture & Cluster Components\n"
            "A Kubernetes cluster consists of a high-availability Control Plane and worker computing nodes:\n\n"
            "1. Control Plane Components:\n"
            "   - `kube-apiserver`: The central REST API gateway exposing the cluster management API; all components communicate through it.\n"
            "   - `etcd`: Highly available, consistent distributed key-value store holding the complete cluster state and configuration.\n"
            "   - `kube-scheduler`: Assigns newly created Pods without assigned nodes to optimal worker nodes based on resource requests and affinity rules.\n"
            "   - `kube-controller-manager`: Runs controller processes (Node Controller, Replication Controller, Endpoint Controller).\n\n"
            "2. Worker Node Components:\n"
            "   - `kubelet`: Primary node agent registering the node and ensuring containers described in PodSpecs are running and healthy.\n"
            "   - `kube-proxy`: Maintains network rules on nodes allowing network communication to Pods from network sessions.\n"
            "   - Container Runtime: Low-level engine (containerd, CRI-O) pulling images and executing containers.\n\n"
            "### 2. Core Kubernetes API Objects\n"
            "• Pod: Smallest deployable unit containing one or more tightly coupled containers sharing network namespace and volumes.\n"
            "• Deployment: Declarative controller managing ReplicaSets, supporting zero-downtime Rolling Updates, rollbacks, and self-healing.\n"
            "• Service Types:\n"
            "  - `ClusterIP`: Default internal virtual IP accessible only within the cluster.\n"
            "  - `NodePort`: Exposes service on each node's IP at a static port (30000-32767).\n"
            "  - `LoadBalancer`: Provisions cloud provider load balancer (AWS NLB/ALB) routing external traffic to the service.\n"
            "• Ingress: Layer 7 HTTP/HTTPS router providing path-based and host-based routing with SSL termination."
        ),
        "short_rubric": [
            "Kubernetes definition and Control Plane vs Worker Node architecture — 1 Mark",
            "Key objects: Pods, Deployments, and Service types — 1 Mark"
        ],
        "long_rubric": [
            "Detailed breakdown of Control Plane (API server, etcd, scheduler, controllers) & Worker components — 5 Marks",
            "Workload primitives (Pods, Deployments, ReplicaSets, StatefulSets, DaemonSets) — 5 Marks",
            "Networking model, Service routing (ClusterIP, NodePort, LoadBalancer), and Ingress Controllers — 5 Marks"
        ]
    },
    "terraform": {
        "title": "Terraform & Infrastructure as Code",
        "short_answer": (
            "Terraform is an open-source Infrastructure as Code (IaC) tool created by HashiCorp that allows developers to define cloud infrastructure using declarative HashiCorp Configuration Language (HCL).\n"
            "• Core Workflow: `terraform init` (download providers/modules), `terraform plan` (dry run execution preview), `terraform apply` (provision resources), `terraform destroy` (tear down).\n"
            "• Key Concepts: Providers, Resources, Variables, Outputs, Modules, and State file (`terraform.tfstate`) with remote locking (S3 + DynamoDB)."
        ),
        "long_answer": (
            "### 1. Declarative Infrastructure as Code (IaC) with Terraform\n"
            "Terraform enables immutable infrastructure provisioning across multi-cloud environments (AWS, Azure, GCP) using declarative HCL.\n\n"
            "### 2. Core Execution Lifecycle\n"
            "1. `terraform init`: Scans root configuration, downloads cloud provider plugins (e.g., hashicorp/aws), and initializes remote backends.\n"
            "2. `terraform validate`: Verifies syntax and configuration correctness without touching cloud APIs.\n"
            "3. `terraform plan`: Computes state diff by querying cloud APIs, compares with `terraform.tfstate`, and generates an execution graph.\n"
            "4. `terraform apply`: Executes planned changes via cloud REST APIs concurrently according to dependency graphs.\n"
            "5. `terraform destroy`: Gracefully tears down all resources managed by the configuration in reverse dependency order.\n\n"
            "### 3. Terraform State Management & Enterprise Best Practices\n"
            "• State File (`terraform.tfstate`): Maps declarative code resources to real-world cloud resource IDs and attributes.\n"
            "• Remote Backends & State Locking: Storing state in Amazon S3 with server-side encryption and enabling DynamoDB state locking (`dynamodb_table`) prevents race conditions and corrupted states during concurrent CI/CD pipeline runs.\n"
            "• Terraform Modules: Reusable, parameterizable infrastructure packages promoting DRY (Don't Repeat Yourself) design.\n"
            "• Workspaces: Isolate state files across multiple deployment environments (dev, staging, prod)."
        ),
        "short_rubric": [
            "Definition of Terraform, IaC, and 4-step workflow (init, plan, apply, destroy) — 1 Mark",
            "State file concept and remote backend with state locking — 1 Mark"
        ],
        "long_rubric": [
            "In-depth explanation of Terraform architecture, declarative HCL, and dependency graph resolution — 5 Marks",
            "Complete lifecycle command deep dive (init, plan, apply, destroy, import, refresh) — 5 Marks",
            "State management architecture (remote backends, S3 + DynamoDB locking, modules, workspaces) — 5 Marks"
        ]
    },
    "cicd": {
        "title": "CI/CD Pipelines & Jenkins",
        "short_answer": (
            "CI/CD (Continuous Integration and Continuous Deployment) is a DevOps practice that automates the software delivery lifecycle.\n"
            "• Continuous Integration (CI): Developers frequently merge code into a shared repository, triggering automated builds and unit tests.\n"
            "• Continuous Delivery (CD): Automatically deploys all validated code changes to staging/production environments with manual approval.\n"
            "• Continuous Deployment: Automatically deploys validated code directly to production with zero manual intervention.\n"
            "• Jenkins Pipeline: Defined in a `Jenkinsfile` (Declarative vs Scripted) with stages: Checkout -> Build -> Test -> Security Scan -> Deploy."
        ),
        "long_answer": (
            "### 1. CI/CD Philosophy & Delivery Stages\n"
            "Continuous Integration and Continuous Delivery automate the path from source code commit to live production deployment:\n"
            "• Continuous Integration: Developers commit code multiple times daily. Automated CI servers compile binaries, run unit/integration tests, and perform static code analysis (SonarQube) to identify bugs early (Shift-Left).\n"
            "• Continuous Delivery: Code passes through automated staging deployments, integration tests, and performance benchmarks, remaining in a deployable state ready for one-click release.\n"
            "• Continuous Deployment: Every change that passes all stages of the automated pipeline is released automatically to production users without human intervention.\n\n"
            "### 2. Jenkins Architecture & Declarative Pipelines\n"
            "• Master-Agent Architecture: Jenkins Master manages scheduling, user interface, and build configurations; distributed Agents (Linux/Docker/K8s) execute the actual build workloads.\n"
            "• Declarative Pipeline (`Jenkinsfile`):\n"
            "  - `agent`: Specifies execution environment (e.g., `agent { docker { image 'maven:3.8-openjdk-17' } }`).\n"
            "  - `stages`: Contains individual sequential steps (`stage('Build')`, `stage('Test')`, `stage('Security Scan')`, `stage('Deploy')`).\n"
            "  - `post`: Executes conditional actions on build completion (`always`, `success`, `failure`, `unstable`).\n\n"
            "### 3. Modern Deployment Strategies\n"
            "• Blue/Green Deployment: Two identical environments; router flips traffic to new Green environment instantly with zero downtime.\n"
            "• Canary Deployment: Route 5-10% of user traffic to the new version to monitor error rates before full rollout."
        ),
        "short_rubric": [
            "Distinction between Continuous Integration, Delivery, and Deployment — 1 Mark",
            "Pipeline stages and Jenkins architecture overview — 1 Mark"
        ],
        "long_rubric": [
            "Comprehensive breakdown of CI/CD phases (Build, Test, Scan, Deploy) and business benefits — 5 Marks",
            "Jenkins Master-Agent architecture and Declarative Jenkinsfile syntax — 5 Marks",
            "Advanced deployment strategies (Blue/Green, Canary, Rolling updates) and automated rollbacks — 5 Marks"
        ]
    },
    "linux": {
        "title": "Linux Administration & Shell Scripting",
        "short_answer": (
            "Linux Administration forms the foundation of cloud engineering and server management.\n"
            "• Core Areas: File System Hierarchy (`/etc`, `/var`, `/home`, `/usr`), Permissions (`chmod 755`, `chown user:group`), Process Management (`ps aux`, `top`, `htop`, `kill -9`), Package Management (`apt`, `yum`), and Systemd services (`systemctl start/enable/status`).\n"
            "• Shell Scripting: Bash scripts using shebang (`#!/bin/bash`), variables, conditionals (`if/else`), loops, and pipes (`|`, `grep`, `awk`, `sed`)."
        ),
        "long_answer": (
            "### 1. Linux Kernel & File System Architecture\n"
            "The Linux operating system is structured in concentric layers: Hardware -> Kernel -> Shell -> Applications.\n"
            "• Standard File Hierarchy: `/bin` (essential binaries), `/etc` (system configuration), `/var/log` (system and app logs), `/proc` (virtual kernel process filesystem), `/tmp` (temporary files).\n\n"
            "### 2. Permissions, Ownership & User Management\n"
            "• File Permissions (r=4, w=2, x=1): Permissions represented as `rwxr-xr--` (User, Group, Others).\n"
            "  - `chmod 755 script.sh` gives read/write/execute to owner, read/execute to group and others.\n"
            "  - `chown -R devops:devops /var/www` changes user and group ownership recursively.\n"
            "• Sudoers configuration (`/etc/sudoers`) for privileged root delegation.\n\n"
            "### 3. Systemd Service Management & Process Control\n"
            "• Systemd Unit Files: Defined in `/etc/systemd/system/myapp.service` with `[Unit]`, `[Service]`, and `[Install]` sections.\n"
            "• Service Commands: `systemctl daemon-reload`, `systemctl start myapp`, `systemctl enable myapp` (start on boot).\n"
            "• Process Diagnostics: `ps -ef | grep app`, `kill -15 <PID>` (graceful SIGTERM), `kill -9 <PID>` (forceful SIGKILL), `netstat -tulpn` / `ss -tulpn` (inspect open network sockets)."
        ),
        "short_rubric": [
            "File hierarchy, permissions (chmod/chown), and process commands — 1 Mark",
            "Systemd service management and basic bash scripting syntax — 1 Mark"
        ],
        "long_rubric": [
            "Detailed explanation of Linux architecture, kernel vs user space, and filesystem tree — 5 Marks",
            "User management, permission bitmasks, umask, and sudo privileges — 5 Marks",
            "Systemd service creation, process management, log inspection with journalctl, and networking tools — 5 Marks"
        ]
    }
}


def _clean_text_for_lookup(text: str) -> str:
    """Strip common question wrappers to extract core subject keywords."""
    clean = text.lower()
    patterns = [
        r"^explain\s+(the\s+)?(concept\s+of\s+)?",
        r"^discuss\s+(the\s+)?",
        r"^describe\s+(the\s+)?",
        r"^what\s+is\s+(the\s+)?",
        r"^how\s+does\s+",
        r"^write\s+short\s+notes\s+on\s+",
        r"^compare\s+and\s+contrast\s+",
        r"\(short\s+answer\)",
        r"\(long\s+answer\)",
        r"\(descriptive\)",
        r"\(mcq\)",
        r"[^\w\s\-]",
    ]
    for pat in patterns:
        clean = re.sub(pat, " ", clean, flags=re.IGNORECASE)
    return " ".join(clean.split()).strip()


def generate_smart_solution(question: Dict[str, Any], db_cursor=None) -> Dict[str, Any]:
    """
    Generate an in-depth, topic-accurate model answer and rubrics for a question.
    """
    q_text = question.get("text", "")
    q_id = question.get("id", "")
    marks = int(question.get("marks", 5))
    topic = question.get("topic", "")
    difficulty = question.get("difficulty", "medium")
    is_long = marks >= 10 or "(long answer)" in q_text.lower()

    clean_q = _clean_text_for_lookup(q_text)
    clean_topic = _clean_text_for_lookup(topic)
    combined_query = f"{clean_q} {clean_topic}".lower()

    # Step 1: Match against rich domain knowledge dictionary
    matched_entry = None
    for key, entry in TOPIC_KNOWLEDGE.items():
        if key in combined_query or key in clean_q or key in clean_topic:
            matched_entry = entry
            break

    if matched_entry:
        solution_text = matched_entry["long_answer"] if is_long else matched_entry["short_answer"]
        rubric = matched_entry["long_rubric"] if is_long else matched_entry["short_rubric"]
        return {
            "question_id": q_id,
            "text": q_text,
            "marks": marks,
            "difficulty": difficulty,
            "solution": solution_text,
            "key_points": rubric
        }

    # Step 2: Search PYQ Database for authentic past question answers
    if db_cursor:
        try:
            # Query by word tokens
            tokens = [w for w in clean_q.split() if len(w) > 3][:4]
            if tokens:
                like_clauses = " AND ".join(["text LIKE ?"] * len(tokens))
                params = [f"%{t}%" for t in tokens]
                db_cursor.execute(
                    f"SELECT answer, topic, text FROM pyq_questions WHERE answer IS NOT NULL AND LENGTH(answer) > 40 AND ({like_clauses}) LIMIT 1",
                    params
                )
                row = db_cursor.fetchone()
                if row and row["answer"]:
                    pyq_ans = row["answer"].strip()
                    # Clean bullet formatting
                    pyq_ans = re.sub(r"^[o•\-\*]\s*", "", pyq_ans)
                    if is_long:
                        sol = (
                            f"### Comprehensive Technical Solution:\n{pyq_ans}\n\n"
                            f"### Architectural Principles & Implementation:\n"
                            f"• Key Components: Ensure all configuration parameters, dependency declarations, and security boundaries are defined.\n"
                            f"• Production Best Practices: Follow standard high availability, observability, and cost governance standards."
                        )
                    else:
                        sol = pyq_ans

                    rubric = [
                        f"Core Concept & Technical Definition ({max(1, marks // 3)} Marks)",
                        f"Architecture & Configuration Details ({max(1, marks // 2)} Marks)",
                        f"Production Use Case & Best Practices ({max(1, marks - (marks // 3) - (marks // 2))} Marks)"
                    ]
                    return {
                        "question_id": q_id,
                        "text": q_text,
                        "marks": marks,
                        "difficulty": difficulty,
                        "solution": sol,
                        "key_points": rubric
                    }
        except Exception:
            pass

    # Step 3: Dynamic Structured Model Solution for arbitrary topics
    target_subject = question.get("subject") or topic or "Cloud & DevOps Architecture"
    if is_long:
        solution_text = (
            f"### 1. Conceptual Overview & Technical Definition\n"
            f"Provide an authoritative definition of {clean_topic or target_subject}, including the foundational terminology, design philosophy, and specific problem domain it addresses.\n\n"
            f"### 2. Architecture & Operational Mechanics\n"
            f"• Core Components: Diagram and explain the major building blocks, service dependencies, and data flow interactions.\n"
            f"• Configuration & Syntax: Provide standard declarative syntax (YAML / JSON / HCL / Bash) or CLI commands used to configure the resource.\n"
            f"• High Availability & Fault Tolerance: Describe multi-zone distribution, health check probing, and automated recovery procedures.\n\n"
            f"### 3. Security, Monitoring & Enterprise Best Practices\n"
            f"• Security Boundaries: Enforce Principle of Least Privilege (IAM policies, network security groups, encryption at rest and in transit).\n"
            f"• Telemetry: Configure metrics, alarms, and structured log streaming to ensure complete operational observability."
        )
        rubric = [
            f"Technical Definition & Architectural Overview ({marks // 3} Marks)",
            f"Step-by-Step Implementation, Configuration & Working Mechanism ({marks // 3} Marks)",
            f"Production Best Practices, High Availability & Security Standards ({marks - (2 * (marks // 3))} Marks)"
        ]
    else:
        solution_text = (
            f"Model Solution for {clean_topic or target_subject}:\n"
            f"1. Definition: Define the core purpose and functional responsibility of {clean_topic or target_subject}.\n"
            f"2. Working Mechanism: State the key architectural components, operational principles, or CLI command parameters.\n"
            f"3. Practical Benefit: Highlight the operational efficiency, fault tolerance, or cost advantages in production."
        )
        rubric = [
            "Core Definition & Conceptual Accuracy — 1 Mark",
            "Key Architectural Features & Production Application — 1 Mark"
        ]

    return {
        "question_id": q_id,
        "text": q_text,
        "marks": marks,
        "difficulty": difficulty,
        "solution": solution_text,
        "key_points": rubric
    }
