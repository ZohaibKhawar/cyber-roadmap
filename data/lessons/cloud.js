"use strict";

/* Step 6: Cloud and containers. */
(() => {
const R = String.raw;

Object.assign(window.LESSONS, {
  "cloud": [
    "In the cloud you rent computers, storage and services from AWS, Microsoft Azure or Google Cloud and control them through a website or an API. The security ideas from earlier steps still apply, but a few things change completely.",
    { h: "What's different" },
    { table: [
      ["", "Your own data centre", "Cloud"],
      ["How you change things", "Rack a server, plug in cables", "One API call, from anywhere, by anyone with the right key"],
      ["Main perimeter", "The network firewall", "Identity: who can call which API"],
      ["Biggest risk", "Unpatched servers, flat networks", "Misconfiguration and over-powered accounts or leaked keys"],
      ["Logging", "You install it", "Built in, but much of it must be switched on and kept"],
      ["Cost of a mistake", "Hardware sits idle", "A leaked key can run up a huge bill in hours"],
    ] },
    { h: "Same idea, three names" },
    "Learn one provider well, then map the others onto it. The concepts transfer; only the names change.",
    { table: [
      ["Idea", "AWS", "Azure", "Google Cloud"],
      ["Virtual machines", "EC2", "Virtual Machines", "Compute Engine"],
      ["File and object storage", "S3", "Blob Storage", "Cloud Storage"],
      ["Private network", "VPC", "Virtual Network (VNet)", "VPC"],
      ["Network rules", "Security groups, network ACLs", "Network security groups", "VPC firewall rules"],
      ["Identity and permissions", "IAM", "Microsoft Entra ID and Azure RBAC", "Cloud IAM"],
      ["Log of every API call", "CloudTrail", "Activity log", "Cloud Audit Logs"],
      ["Keys and secrets", "KMS, Secrets Manager", "Key Vault", "Cloud KMS, Secret Manager"],
      ["Built-in threat detection", "GuardDuty", "Defender for Cloud", "Security Command Center"],
      ["Managed Kubernetes", "EKS", "AKS", "GKE"],
    ] },
    { warn: "Before building anything in a personal cloud account: turn on MFA for the root or global admin account, set a budget alert, and delete what you build when you're done. Leaked keys from learners' GitHub repos are found and abused by bots within minutes." },
    { h: "How to work through this step" },
    { ol: [
      "[[shared-resp|Shared responsibility]]: what's yours to secure.",
      "[[cloud-iam|Cloud IAM]]: the most important cloud security skill.",
      "[[cloud-fundamentals|AWS or Azure fundamentals]]: networks, compute and storage.",
      "[[cloud-logs|Cloud logging]]: what gets recorded and how to read it.",
      "[[containers|Containers]]: how most new software is shipped.",
    ] },
    { check: [
      ["Why is identity called the new perimeter in the cloud?", "Anyone on the internet can reach the cloud provider's API. What stops them is whether their identity (user, role or key) is allowed to make that call."],
      ["What's the Azure name for AWS CloudTrail's job?", "The Azure Activity log (with Entra ID sign-in and audit logs for identity events)."],
    ] },
  ],

  "shared-resp": [
    "The provider secures the cloud itself: buildings, hardware, the hypervisor. You secure what you put in it. Where the line falls depends on the kind of service.",
    { fig: "shared-resp", cap: "Who secures what in each service model. Data, accounts and the devices people use are always the customer's job." },
    { terms: [
      ["IaaS (infrastructure)", "You rent virtual machines and networks and run everything on them. Example: an EC2 or Azure VM."],
      ["PaaS (platform)", "You bring code and data; the provider runs the operating system and runtime. Example: Azure App Service, AWS Lambda, a managed database."],
      ["SaaS (software)", "You just use the application. Example: Microsoft 365, Salesforce, Gmail."],
    ] },
    { h: "Where customers usually go wrong" },
    { ul: [
      "Storage buckets or blob containers left readable by anyone on the internet.",
      "Access keys committed to code repositories or pasted into chat.",
      "Admin accounts without MFA, or the root account used for daily work.",
      "Security groups open to `0.0.0.0/0` on SSH (22) or RDP (3389).",
      "Roles with `*` permissions because \"it was easier\".",
      "Logging switched off, or kept for too short a time to investigate.",
    ] },
    { tip: "Even in SaaS, settings are yours: who can share files outside the company, whether MFA is required, how long audit logs are kept. A surprising number of breaches start in SaaS settings nobody reviewed." },
    { check: [
      ["Your company runs a database on a managed PaaS service. Who patches the database engine?", "The provider. You're still responsible for the data, who can access it, network exposure and the app's settings."],
      ["In SaaS, is protecting user accounts the provider's job?", "No. Accounts, identities and data are always the customer's responsibility, in every model."],
    ] },
  ],

  "cloud-iam": [
    { h: "Who can do what" },
    { terms: [
      ["User", "A person (or, badly, a script) with long-term credentials."],
      ["Group", "A set of users that share permissions."],
      ["Role / managed identity", "A set of permissions that a person, service or VM takes on temporarily. Credentials are short-lived and rotate on their own."],
      ["Policy", "A document that says which actions are allowed or denied on which resources."],
      ["Access key", "A long-lived key for programmatic access. Powerful, easy to leak, best avoided in favour of roles."],
    ] },
    { h: "Reading a policy" },
    { code: R`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::reports-bucket/*"
    }
  ]
}`, label: "AWS IAM policy: read files in one bucket, nothing else" },
    "Effect, Action, Resource: allow reading objects, only in `reports-bucket`. Compare it with the policy below, which is a real finding in many audits.",
    { code: R`{
  "Version": "2012-10-17",
  "Statement": [{ "Effect": "Allow", "Action": "*", "Resource": "*" }]
}`, label: "Don't: every action on every resource" },
    { h: "How AWS decides" },
    { fig: "iam-eval", cap: "AWS's evaluation logic, simplified. Organisation-wide guardrails (service control policies) and permission boundaries can only take permissions away, never add them." },
    { h: "Azure in one sentence" },
    "An Azure role assignment is a security principal (user, group or managed identity) + a role definition (such as Reader or Contributor) + a scope (management group, subscription, resource group or single resource). Assign at the smallest scope that works.",
    { h: "Habits that prevent breaches" },
    { ul: [
      "Lock away the root or global admin account with MFA and use it almost never.",
      "Give people access through single sign-on and roles, not individual long-term users and keys.",
      "Start with no permissions and add only what's needed; review unused permissions regularly.",
      "Use roles and managed identities for workloads instead of access keys in config files.",
      "Alert on new access keys, MFA being removed and admin roles being granted.",
    ] },
    { try: [
      "Play flAWS (flaws.cloud), a free, legal AWS security game that teaches common IAM and S3 mistakes.",
      "In your own account, create a role that can only read one bucket, and test that it can't delete anything.",
    ] },
    { check: [
      ["A policy allows `s3:*` but another policy attached to the same user explicitly denies `s3:DeleteObject`. Can they delete?", "No. An explicit Deny always wins."],
      ["Why are roles preferred over access keys?", "Role credentials are temporary and rotate automatically, so a leak expires quickly. Access keys last until someone deletes them."],
    ] },
  ],

  "cloud-fundamentals": [
    { h: "Regions, zones and networks" },
    "A region is a geographic area (such as Canada Central). Each region has several availability zones: separate data centres with their own power and networking. Spreading servers across zones keeps a service up when one zone fails.",
    { fig: "vpc", cap: "A typical AWS layout: public subnets hold only the load balancer and NAT gateway; servers and databases sit in private subnets with no route in from the internet." },
    { h: "Security groups and network ACLs" },
    { table: [
      ["", "Security group", "Network ACL"],
      ["Applies to", "Each instance's network interface", "A whole subnet"],
      ["Remembers connections?", "Yes (stateful): replies allowed automatically", "No (stateless): replies need their own rule"],
      ["Rules", "Allow only", "Allow and deny, checked in number order"],
      ["Typical use", "The main control: \"web servers accept 443 from the load balancer\"", "A coarse extra layer, such as blocking a bad range"],
    ], cap: "AWS names. Azure's network security groups are stateful and can be attached to subnets or interfaces." },
    { tip: "Security groups can reference other security groups: \"database accepts 5432 from the app-server group\" stays correct even when servers come and go." },
    { h: "Accounts and subscriptions" },
    "Big organisations use many accounts (AWS) or subscriptions (Azure), not one. Separate accounts for production, development and security tooling limit the damage from a mistake or breach. AWS Organizations and Azure management groups apply guardrails across all of them.",
    { h: "Your first week in a cloud account" },
    { ol: [
      "Turn on MFA for the root or global admin account and stop using it.",
      "Set a budget with an email alert at a few dollars.",
      "Create your own admin access through IAM Identity Center (AWS) or Entra ID (Azure), with MFA.",
      "Make sure CloudTrail or the Activity log is kept, and look at it.",
      "Build a VM in a private subnet, reach it through a bastion or Session Manager, then delete everything.",
    ] },
    { check: [
      ["Why put the database in a private subnet?", "It has no route from the internet, so even a mistaken firewall rule doesn't expose it directly."],
      ["A security group allows inbound 443. Do you also need an outbound rule for the replies?", "No. Security groups are stateful, so replies to allowed inbound traffic are allowed automatically."],
    ] },
  ],

  "cloud-logs": [
    { h: "What gets logged" },
    { table: [
      ["Kind", "Records", "On by default?"],
      ["Management (control plane)", "Every API call that creates, changes or deletes resources: CloudTrail management events, Azure Activity log", "Yes, but kept only about 90 days unless you store it"],
      ["Data access (data plane)", "Reading and writing data, such as each S3 object fetched", "Usually no; it's high volume and costs money"],
      ["Identity", "Sign-ins and directory changes: Entra ID sign-in and audit logs", "Yes; retention depends on licence (7 or 30 days in Entra ID)"],
      ["Network", "Flow logs: which IPs talked on which ports", "No"],
      ["Service and OS logs", "Web server, database and operating system logs on your VMs", "Only if you collect them"],
    ] },
    { warn: "The most common answer in cloud incident response is \"we don't know, because that log wasn't on\". Decide what to keep before you need it, and send it somewhere attackers can't delete." },
    { h: "Reading a CloudTrail event" },
    { code: R`{
  "eventTime": "2026-11-10T03:14:07Z",
  "eventSource": "signin.amazonaws.com",
  "eventName": "ConsoleLogin",
  "awsRegion": "us-east-1",
  "sourceIPAddress": "203.0.113.45",
  "userIdentity": { "type": "IAMUser", "userName": "alice" },
  "responseElements": { "ConsoleLogin": "Failure" },
  "additionalEventData": { "MFAUsed": "No" },
  "errorMessage": "Failed authentication"
}`, label: "A failed console login (trimmed)" },
    "Who (`userIdentity`), did what (`eventName`), from where (`sourceIPAddress`), when (`eventTime`), and did it work (`responseElements`, `errorCode` or `errorMessage`). Every cloud log answers the same questions with different field names.",
    { h: "Worth an alert" },
    { table: [
      ["Event", "Why"],
      ["Root or global admin sign-in", "Should almost never happen"],
      ["MFA removed or a new access key created", "Classic persistence after an account is taken over"],
      ["Logging stopped or deleted (`StopLogging`, `DeleteTrail`)", "Someone covering their tracks"],
      ["Security group opened to `0.0.0.0/0`", "Something just got exposed to the internet"],
      ["Storage made public", "A data leak waiting to happen"],
      ["Activity in a region you never use", "Attackers often launch crypto-miners far from where anyone looks"],
    ] },
    { flow: ["Every account|CloudTrail, Activity log", "Central log account|locked down, write-once", "SIEM|search and alert"], cap: "Send logs from every account to one place that ordinary admins can't change." },
    { check: [
      ["Which CloudTrail field tells you who made the call?", "`userIdentity`."],
      ["Why send cloud logs to a separate, locked-down account?", "An attacker with admin rights in the original account could delete the logs there."],
    ] },
  ],

  "containers": [
    { h: "Containers and virtual machines" },
    { fig: "vm-container", cap: "Virtual machines each run a full operating system. Containers share the host's kernel, so they start in seconds and use far less memory, but the isolation between them is thinner." },
    { terms: [
      ["Image", "A read-only package of an app and everything it needs, built from a Dockerfile."],
      ["Container", "A running copy of an image."],
      ["Registry", "Where images are stored and shared, such as Docker Hub or a cloud registry."],
      ["Kubernetes", "Software that runs many containers across many machines, restarts them and scales them."],
    ] },
    { code: R`FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN useradd --create-home appuser
USER appuser
CMD ["python", "app.py"]`, label: "A Dockerfile that doesn't run as root" },
    "A small base image means fewer packages to patch, and `USER appuser` means a compromised app doesn't get root inside the container.",
    { h: "Kubernetes in one table" },
    { table: [
      ["Piece", "What it is", "Security angle"],
      ["Cluster", "The whole system", ""],
      ["Control plane / API server", "The brain everything talks to", "Whoever controls the API controls the cluster; never expose it openly"],
      ["Node", "A machine that runs containers", "A container escape lands here"],
      ["Pod", "One or more containers running together", "Should run as non-root, with no extra privileges"],
      ["Namespace", "A folder for separating teams or apps", "Combine with RBAC to limit who can touch what"],
      ["Secret", "Passwords and keys for pods", "Only base64-encoded by default; turn on encryption at rest or use an external vault"],
      ["Network policy", "Rules for which pods can talk", "Without them, every pod can reach every other pod"],
    ] },
    { h: "A container security checklist" },
    { ul: [
      "Scan images for known vulnerabilities in the build pipeline (for example with Trivy or Grype).",
      "Use small, official, up-to-date base images, and rebuild them regularly.",
      "Don't run containers as root or with `--privileged`.",
      "Keep secrets out of images; inject them at run time.",
      "Apply the Kubernetes Pod Security Standards (Privileged, Baseline, Restricted) and network policies.",
      "Lock down the Kubernetes API and audit who has cluster-admin.",
    ] },
    { check: [
      ["Why is a container's isolation weaker than a VM's?", "Containers share the host's kernel. A kernel flaw or a badly configured privileged container can let code escape to the host."],
      ["Are Kubernetes Secrets encrypted by default?", "Not at rest by default: they're base64-encoded, which anyone can decode. Encryption at rest has to be configured."],
    ] },
  ],
});

Object.assign(window.FIGURES, {
  "shared-resp": (g) => {
    const cols = ["On-premises", "IaaS", "PaaS", "SaaS"];
    const rows = [
      ["Data and content", "YYYY"],
      ["Accounts and identities", "YYYY"],
      ["Devices people use", "YYYY"],
      ["Applications", "YYSP"],
      ["Network controls", "YYSP"],
      ["Operating system", "YYPP"],
      ["Virtualisation", "YPPP"],
      ["Physical hosts and network", "YPPP"],
      ["Physical data centre", "YPPP"],
    ];
    const words = { Y: "You", S: "Shared", P: "Provider" };
    const tones = { Y: "a", S: "y", P: "t" };
    const out = [];
    cols.forEach((c, i) => out.push(g.text(220 + i * 115 + 55, 26, c, "c b")));
    rows.forEach(([label, who], r) => {
      const y = 40 + r * 32;
      out.push(g.text(12, y + 18.5, label, "s b"));
      [...who].forEach((k, i) => out.push(g.box(220 + i * 115, y, 110, 28, `^${words[k]}`, tones[k], 5)));
    });
    [["a", "You, the customer"], ["y", "Shared"], ["t", "The cloud provider"]].forEach(([cls, t], i) => {
      out.push(g.rect(220 + i * 150, 338, 14, 14, cls, 3), g.text(240 + i * 150, 349, t, "s"));
    });
    return g.svg(690, 362, out);
  },

  "iam-eval": (g) => g.svg(680, 316, [
    g.box(20, 14, 320, 50, ["!A request arrives", "~alice wants s3:GetObject on reports-bucket"], "m"),
    g.arrow(180, 64, 180, 93),
    g.box(20, 94, 320, 46, "!Does any policy explicitly Deny it?"),
    g.arrow(340, 117, 419, 117, "ac"), g.text(380, 110, "yes", "c s b ac"),
    g.box(420, 94, 240, 46, ["!Denied", "~an explicit Deny always wins"], "r"),
    g.arrow(180, 140, 180, 173), g.text(190, 161, "no", "s b mu"),
    g.box(20, 174, 320, 46, "!Does any policy Allow it?"),
    g.arrow(340, 197, 419, 197, "te"), g.text(380, 190, "yes", "c s b te"),
    g.box(420, 174, 240, 46, ["!Allowed"], "g"),
    g.arrow(180, 220, 180, 253), g.text(190, 241, "no", "s b mu"),
    g.box(20, 254, 320, 46, ["!Denied", "~nothing allowed it: the implicit deny"], "a"),
  ]),

  "vpc": (g) => g.svg(680, 350, [
    g.rect(10, 10, 660, 330, "n", 12),
    g.text(24, 32, "Region: ca-central-1 (Canada Central)", "s b"),
    g.box(270, 16, 140, 34, "^Internet gateway", "m"),
    g.rect(25, 62, 630, 266, "o", 10),
    g.text(40, 84, "VPC 10.0.0.0/16", "s b mo"),
    g.rect(40, 96, 295, 222, "n", 8), g.text(52, 116, "Availability zone A", "s mu"),
    g.rect(345, 96, 295, 222, "n", 8), g.text(357, 116, "Availability zone B", "s mu"),
    g.path("M340 50 V160 M321 160 H359"),
    g.box(55, 126, 265, 66, ["!Public subnet  10.0.1.0/24", "~load balancer, NAT gateway", "~routes to the internet gateway"], "t"),
    g.box(360, 126, 265, 66, ["!Public subnet  10.0.2.0/24", "~load balancer, NAT gateway", "~routes to the internet gateway"], "t"),
    g.box(55, 204, 265, 100, ["!Private subnet  10.0.11.0/24", "~app servers and database", "~no route in from the internet", "~goes out through the NAT gateway", "~security group on every server"], "a"),
    g.box(360, 204, 265, 100, ["!Private subnet  10.0.12.0/24", "~app servers and database", "~no route in from the internet", "~goes out through the NAT gateway", "~security group on every server"], "a"),
  ]),

  "vm-container": (g) => {
    const out = [g.text(170, 22, "Virtual machines", "c b"), g.text(510, 22, "Containers", "c b")];
    for (let i = 0; i < 3; i++) {
      const x = 20 + i * 104;
      out.push(g.box(x, 40, 92, 40, ["!App", "~+ libraries"], "a"), g.box(x, 84, 92, 40, ["!Guest OS", "~its own kernel"], "y"));
      const cx = 360 + i * 104;
      out.push(g.box(cx, 40, 92, 40, ["!App", "~+ libraries"], "a"));
    }
    out.push(
      g.box(20, 130, 300, 40, ["!Hypervisor", "~ESXi, Hyper-V, KVM"], "d"),
      g.box(20, 176, 300, 40, "!Hardware", "m"),
      g.box(360, 84, 300, 40, ["!Container runtime", "~containerd, Docker"], "d"),
      g.box(360, 130, 300, 40, ["!Host OS", "~one shared Linux kernel"], "t"),
      g.box(360, 176, 300, 40, "!Hardware", "m"),
      g.text(170, 242, "Each VM boots its own OS:", "c s"), g.text(170, 258, "strong isolation, heavier", "c s mu"),
      g.text(510, 242, "Containers share the host kernel:", "c s"), g.text(510, 258, "light and fast, thinner isolation", "c s mu"),
    );
    return g.svg(680, 270, out);
  },
});
})();
