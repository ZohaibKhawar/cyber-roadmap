"use strict";

/* Step 1: IT foundations. */
Object.assign(window.LESSONS, {
  "it-basics": [
    "Before security makes sense, a computer has to stop being a magic box. Every machine you will ever defend is the same five layers stacked on top of each other, and every attack lands on one of them.",
    { fig: "it-stack", cap: "Each layer can be attacked, and each has its own security controls. Most security tools you'll use at work (EDR, event logs) live at the operating system layer." },
    { h: "Why this step matters for security" },
    "Security analysts spend their day deciding whether something is normal. A process using all the CPU, a new service, a laptop that rebooted at 3 a.m.: you can only call those odd if you know what normal looks like. That knowledge comes from fixing computers.",
    { table: [
      ["IT skill", "Where it shows up in security"],
      ["Knowing what a normal process list looks like", "Spotting malware in an EDR process tree"],
      ["Reading error messages and logs", "Investigating alerts in a SIEM"],
      ["Reinstalling and imaging machines", "Recovering after ransomware"],
      ["Talking calmly to frustrated users", "Interviewing a user whose account was phished"],
    ] },
    { h: "How to work through this step" },
    { ol: [
      "Read [[hardware-os|Hardware and operating systems]] so you know the parts and how a computer starts.",
      "Learn the [[troubleshooting|troubleshooting method]]; you'll use it for the rest of your career.",
      "Build the [[virtualization|home lab]]. Everything else on this roadmap gets practised there.",
      "Skim [[ticketing|tickets and customer service]]; it's what help desk interviews test.",
    ] },
    { tip: "You don't need A+ to start, but its objectives list is a free, well-organised syllabus for this whole step." },
    { check: [
      ["Which layer do most security tools such as EDR watch?", "The operating system layer: processes, services, files, network connections and logs."],
      ["Why does help desk experience help in a SOC?", "You learn what normal looks like and how to troubleshoot under pressure, which is exactly what alert triage needs."],
    ] },
  ],

  "hardware-os": [
    { h: "The parts that matter" },
    "You don't need to build PCs, but you should know what each part does and what it looks like when that part is the problem.",
    { table: [
      ["Part", "What it does", "When it's the problem", "Security angle"],
      ["CPU", "Runs instructions", "Fans loud, everything slow, one process at 100%", "Crypto-mining malware often shows up as constant high CPU"],
      ["Memory (RAM)", "Holds running programs and their data", "Slow switching between apps, crashes", "Passwords and keys sit in memory, which is why memory forensics exists"],
      ["Storage (SSD/HDD)", "Keeps files when the power is off", "Disk full, files corrupt, slow boot", "Ransomware encrypts it; full-disk encryption protects a stolen laptop"],
      ["Network card", "Connects to wired or Wi-Fi networks", "No IP address, drops off Wi-Fi", "Every connection in and out passes through it"],
      ["TPM chip", "Stores keys securely on the motherboard", "BitLocker asks for a recovery key", "Lets disk encryption unlock only on the right, untampered machine"],
    ] },
    { h: "How a computer starts" },
    "Booting is a relay race. Each stage checks and hands control to the next one. Knowing the order explains why some malware is so hard to remove.",
    { fig: "boot", cap: "From power button to login. Secure Boot only lets signed bootloaders run, and the TPM records what loaded so encryption keys are only released to a clean boot." },
    { h: "Processes, services and scheduled tasks" },
    { terms: [
      ["Program", "A file on disk, such as `chrome.exe` or `/usr/bin/ssh`."],
      ["Process", "A running copy of a program, with an ID (PID), an owner and a parent process that started it."],
      ["Service (Windows) / daemon (Linux)", "A process that runs in the background, usually starting at boot and often with high privileges."],
      ["Scheduled task / cron job", "Something set to run at a time or on an event, like a nightly backup."],
      ["Driver / kernel module", "Code that runs inside the operating system core to talk to hardware. It has the most power of all."],
    ] },
    "Attackers love services and scheduled tasks because they survive a reboot. That's why investigators always check what's set to start automatically.",
    { table: [
      ["Where programs start automatically", "Windows", "Linux", "macOS"],
      ["Background services", "Services (`services.msc`)", "systemd units (`systemctl list-units`)", "LaunchDaemons"],
      ["At user login", "Startup folder, Run registry keys", "Shell profile files such as `.bashrc`", "LaunchAgents, Login Items"],
      ["On a schedule", "Task Scheduler", "cron, systemd timers", "launchd"],
    ] },
    { h: "Where each operating system keeps things" },
    { table: [
      ["", "Windows", "Linux", "macOS"],
      ["System files", "`C:\\Windows`", "`/bin`, `/usr`, `/etc`", "`/System`"],
      ["User files", "`C:\\Users\\name`", "`/home/name`", "`/Users/name`"],
      ["Logs", "Event Viewer (`.evtx` files)", "`/var/log`, `journalctl`", "Console app, `log show`"],
      ["Installing software", "MSI installers, `winget`", "`apt`, `dnf`", "App Store, Homebrew"],
      ["File system", "NTFS", "ext4, XFS, Btrfs", "APFS"],
    ] },
    { try: [
      "Open Task Manager on Windows (Ctrl+Shift+Esc), go to the Details tab and add the Command line column.",
      "Find three processes you don't recognise and look up what they are.",
      "On Linux, run `ps aux --forest` and notice which processes are the parents of others.",
    ] },
    { check: [
      ["What does Secure Boot protect against?", "Unsigned or tampered bootloaders and early boot code, such as bootkits that would load before the operating system and its security tools."],
      ["Name two places Windows starts programs automatically.", "Any two of: services, the Run registry keys, the Startup folder, scheduled tasks."],
      ["Why might a security analyst care that a laptop's CPU is stuck at 100%?", "It could be a crypto miner or other malware, not just a slow computer. You'd check which process is responsible and whether it should be there."],
    ] },
  ],

  "troubleshooting": [
    "Troubleshooting is a method, not a talent. People who look like naturals are just following steps without saying them out loud.",
    { h: "The method" },
    "CompTIA teaches it as six steps in A+ (Network+ splits plan and fix into two). It's the same loop doctors and incident responders use: gather facts, guess, test, act, check, record.",
    { fig: "troubleshoot", cap: "The troubleshooting loop. If testing proves your theory wrong, form a new one; don't start changing things at random." },
    { ol: [
      "**Identify the problem.** Ask the user what they see, what changed and when it last worked. Reproduce it yourself. Back up before you touch anything.",
      "**Establish a theory.** Start with the obvious: is it plugged in, is the account locked, is the disk full?",
      "**Test the theory.** Prove it. If you're wrong, go back to step 2 or escalate.",
      "**Plan and fix.** Think about side effects, then make one change at a time.",
      "**Verify.** Have the user confirm it works. Ask whether this could happen again and prevent it if you can.",
      "**Document.** What was wrong, what you did and why. The next person (often you) will thank you.",
    ] },
    { h: "Questions that find the cause fast" },
    { ul: [
      "What changed? Updates, new software, a new password, a moved desk.",
      "Is it one user, one machine, one site or everyone?",
      "When did it last work?",
      "What does the error say, word for word? Take a screenshot.",
      "Can you make it happen again on purpose?",
    ] },
    { h: "Worked example: \"the internet is down\"" },
    "Split the path in half and test each side. Each test removes a whole set of possible causes.",
    { code: "REM 1. Do I have an IP address, a gateway and a DNS server?\nipconfig /all\n\nREM 2. Can I reach my router (the default gateway)?\nping 192.168.1.1\n\nREM 3. Can I reach the internet by IP address?\nping 1.1.1.1\n\nREM 4. Does DNS work?\nnslookup example.com\n\nREM 5. Where along the path does it stop?\ntracert example.com", label: "Windows command prompt, in this order" },
    { table: [
      ["Result", "What it tells you"],
      ["IP address starts with `169.254`", "DHCP failed: the machine never got an address. Check the cable, Wi-Fi or DHCP server."],
      ["Can't ping the gateway", "Local problem: cable, Wi-Fi, switch port or VLAN."],
      ["Gateway works, `1.1.1.1` doesn't", "Problem between the router and the internet: the ISP or the firewall."],
      ["`1.1.1.1` works, `nslookup` fails", "DNS is broken. Websites fail by name but work by IP."],
      ["Everything above works", "The problem is the browser, a proxy setting or the website itself."],
    ] },
    { h: "The security version" },
    "Incident response is troubleshooting with evidence. Two habits carry straight over: find out what changed, and write everything down with times. One habit you have to unlearn: when a machine might be hacked, don't reboot or reimage it first. That destroys the evidence in memory. Isolate it and ask the security team.",
    { tip: "A good ticket note: \"User could not reach the file share. `ping` to FILE01 worked; `net use` returned error 1326 (bad password). Account was locked after a password change on a phone. Unlocked it, removed the old password from the phone, confirmed access.\"" },
    { check: [
      ["A PC shows the IP address 169.254.12.7. What's the most likely cause?", "It didn't get an address from DHCP and gave itself a link-local one. Check the network connection and the DHCP server."],
      ["Websites work by IP address but not by name. What's broken?", "DNS."],
      ["Why shouldn't you reimage a laptop that might be infected before talking to security?", "Reimaging destroys evidence, especially what's in memory and on disk, so nobody can find out how the attacker got in or what they took."],
    ] },
  ],

  "virtualization": [
    "A virtual machine (VM) is a whole computer running as a program inside another computer. Your home lab is made of them, so you can build, break and restore machines without risking your own.",
    { h: "Two kinds of hypervisor" },
    { fig: "hypervisors", cap: "Type 1 hypervisors run straight on the hardware (servers and the cloud). Type 2 run as an app on your normal operating system (home labs)." },
    { h: "Network modes decide what a VM can reach" },
    "This is the setting people get wrong most often, and it matters for safety. The names below are VirtualBox's; VMware has the same ideas under slightly different names.",
    { table: [
      ["Mode", "VM can reach the internet?", "Other devices can reach the VM?", "Use it for"],
      ["NAT", "Yes", "No", "A single VM that just needs updates"],
      ["NAT Network", "Yes", "Only other VMs on that NAT network", "Several lab VMs that talk to each other and need updates"],
      ["Bridged", "Yes", "Yes, it's on your home network like a real PC", "Rarely in a lab; avoid for anything risky"],
      ["Host-only", "No", "Only your host PC", "Reaching a lab VM from your own machine"],
      ["Internal network", "No", "Only other VMs on the same internal network", "An isolated lab and anything that touches malware"],
    ] },
    { h: "A good first lab" },
    { fig: "homelab", cap: "A three-machine lab on an isolated internal network. The router VM gives the lab internet for updates without putting it on your home network." },
    { table: [
      ["Machine", "What to install", "RAM", "Why"],
      ["DC01", "Windows Server (free evaluation)", "4 GB", "Becomes your Active Directory domain controller"],
      ["WS01", "Windows 11 Enterprise (free evaluation)", "4 GB", "A normal user's laptop that creates real logs"],
      ["LNX01", "Ubuntu Server", "2 GB", "Linux practice, and later a log server or SIEM"],
      ["Router (optional)", "pfSense or OPNsense", "1 GB", "Firewall rules and logs to practise on"],
    ] },
    { note: "16 GB of RAM in your PC is comfortable for this lab; 8 GB works if you run two VMs at a time. Turn on hardware virtualization (Intel VT-x or AMD-V) in your BIOS or UEFI settings if VMs refuse to start. Microsoft's Evaluation Center offers Windows Server and Windows 11 Enterprise evaluations for free." },
    { h: "Snapshots" },
    "A snapshot saves a VM's exact state so you can roll back in seconds. Take one after a clean install, and again before any big change. Snapshots are not backups, though: they live on the same disk and are lost with it.",
    { try: [
      "Install VirtualBox and create an internal network called `lab-net`.",
      "Install Ubuntu Server on it and give it a static address such as `10.10.10.30/24`.",
      "Take a snapshot called `clean-install`.",
      "Break something on purpose (delete `/etc/hosts`), then restore the snapshot.",
    ] },
    { warn: "Never put a VM that runs malware or vulnerable software on a bridged network. Keep risky machines on an internal network with no route to your home devices." },
    { check: [
      ["Which hypervisor type is VirtualBox?", "Type 2: it runs as an application on top of your normal operating system."],
      ["Which network mode keeps lab VMs isolated from your home network while letting them talk to each other?", "Internal network (or a NAT network if they also need internet access)."],
      ["Why isn't a snapshot a backup?", "It's stored alongside the VM on the same disk, so a disk failure or deleted VM loses both."],
    ] },
  ],

  "ticketing": [
    "Every IT and security team runs on tickets. A ticket is a record of a problem or request: who raised it, what's wrong, who's working on it and what was done. In a SOC the same idea is called a case or an incident.",
    { h: "The life of a ticket" },
    { flow: ["New|user or alert raises it", "Triaged|priority set", "Assigned|an owner", "In progress", "Waiting|on user or vendor", "Resolved|fix confirmed", "Closed"], cap: "Typical ticket states. The names vary between tools such as ServiceNow and Jira Service Management, but the flow is the same." },
    { h: "Four kinds of ticket" },
    "Most service desks follow ITIL, a common set of IT service practices. You'll hear these words in interviews.",
    { table: [
      ["Type", "Meaning", "Example"],
      ["Incident", "Something is broken or worse than normal", "Outlook won't open"],
      ["Service request", "Someone wants something standard", "New starter needs a laptop and accounts"],
      ["Problem", "The underlying cause of repeated incidents", "Why do 40 laptops lose Wi-Fi every Monday?"],
      ["Change", "A planned change to systems, usually approved first", "Upgrade the VPN appliance on Saturday night"],
    ] },
    { h: "Priority is impact times urgency" },
    { table: [
      ["", "Urgent", "Can wait"],
      ["Many people affected", "**P1** critical: drop everything", "**P2** high"],
      ["One person affected", "**P3** medium", "**P4** low"],
    ], cap: "A simple priority matrix. Real ones often have more levels, and each priority has a target response time called an SLA." },
    { h: "Writing notes people can use" },
    { table: [
      ["Weak note", "Strong note"],
      ["Fixed.", "Printer queue on PRINT01 was stuck. Restarted the Print Spooler service, test page printed, user confirmed."],
      ["User can't log in, reset password.", "Account locked at 09:12 after 10 failed attempts from the user's old phone. Unlocked, user removed the saved password from the phone. No signs of anyone else trying the account."],
    ] },
    { h: "Talking to frustrated people" },
    { ul: [
      "Let them finish. Repeat the problem back in your own words.",
      "Say what you're going to do and roughly when you'll update them.",
      "Avoid jargon; explain the fix in one plain sentence.",
      "Never blame the user, even when it was their fault.",
      "In security, be extra careful: a user who clicked a phishing link must feel safe reporting it, or next time they won't.",
    ] },
    { check: [
      ["The CEO's laptop won't connect to Wi-Fi before a board meeting. Incident or service request, and what priority?", "An incident. Impact is one person, but urgency is very high, so many teams would treat it as P2 or escalate it. Be ready to explain your reasoning."],
      ["Why are clear ticket notes important in security?", "Notes are evidence. Someone else (or an auditor or lawyer) may need to know exactly what was seen and done, and when."],
    ] },
  ],
});

Object.assign(window.FIGURES, {
  "it-stack": (g) => {
    const rows = [
      [["!People", "~users, passwords, habits"], "phishing training, MFA"],
      [["!Applications", "~browser, Office, business apps"], "patching, app allow-lists"],
      [["!Operating system", "~processes, services, files, logs"], "EDR, event logs, permissions"],
      [["!Firmware", "~UEFI, Secure Boot, TPM chip"], "firmware updates, Secure Boot"],
      [["!Hardware", "~CPU, memory, storage, network card"], "asset inventory, disk encryption"],
    ];
    const out = [g.text(20, 22, "The stack, top to bottom", "b"), g.text(420, 22, "What defenders watch", "b te")];
    rows.forEach(([left, right], i) => {
      const y = 36 + i * 58;
      out.push(g.box(20, y, 380, 50, left, i === 2 ? "d" : ""), g.line(400, y + 25, 420, y + 25), g.box(420, y, 240, 50, "^" + right, "t"));
    });
    return g.svg(680, 330, out);
  },

  "boot": (g) => {
    const w = 145;
    const top = [[11, ["!1  Power on", "~board gets power"], ""], [182, ["!2  UEFI firmware", "~POST: tests hardware"], "a"],
      [353, ["!3  Secure Boot", "~checks signatures"], "a"], [524, ["!4  Bootloader", "~Boot Manager / GRUB"], "a"]];
    const bottom = [[524, ["!5  Kernel", "~OS core + drivers"], ""], [353, ["!6  Services", "~services.exe, systemd"], ""], [182, ["!7  Login", "~user session starts"], "t"]];
    const out = [];
    top.forEach(([x, label, cls]) => out.push(g.box(x, 20, w, 62, label, cls)));
    bottom.forEach(([x, label, cls]) => out.push(g.box(x, 130, w, 62, label, cls)));
    out.push(
      g.arrow(156, 51, 181, 51), g.arrow(327, 51, 352, 51), g.arrow(498, 51, 523, 51),
      g.arrow(596, 82, 596, 129),
      g.arrow(524, 161, 499, 161), g.arrow(353, 161, 328, 161),
      g.text(340, 222, "Steps 2 to 4 run before the operating system and its security tools exist, so Secure Boot", "c s mu"),
      g.text(340, 238, "and the TPM check them. Malware that hides there is called a bootkit.", "c s mu"),
    );
    return g.svg(680, 250, out);
  },

  "troubleshoot": (g) => {
    const w = 190;
    const h = 64;
    return g.svg(680, 250, [
      g.box(20, 50, w, h, ["!1  Identify the problem", "~ask, reproduce, back up"], "m"),
      g.box(245, 50, w, h, ["!2  Form a theory", "~question the obvious"], "y"),
      g.box(470, 50, w, h, ["!3  Test the theory", "~prove the cause"], "y"),
      g.box(470, 170, w, h, ["!4  Plan and fix", "~or escalate"], "a"),
      g.box(245, 170, w, h, ["!5  Verify", "~fully working? prevent it"], "t"),
      g.box(20, 170, w, h, ["!6  Document", "~what, why and how"], "t"),
      g.arrow(210, 82, 244, 82), g.arrow(435, 82, 469, 82), g.arrow(565, 114, 565, 169),
      g.arrow(470, 202, 436, 202), g.arrow(245, 202, 211, 202),
      g.path("M545 50 C545 12 360 12 360 48", "ar ac"),
      g.text(452, 13, "wrong? form a new theory", "c s ac"),
    ]);
  },

  "hypervisors": (g) => g.svg(680, 320, [
    g.text(170, 22, "Type 1: bare metal", "c b"),
    g.text(510, 22, "Type 2: hosted", "c b"),
    g.box(20, 40, 92, 50, ["!VM", "~Windows"], "a"), g.box(124, 40, 92, 50, ["!VM", "~Linux"], "a"), g.box(228, 40, 92, 50, ["!VM", "~Linux"], "a"),
    g.box(20, 100, 300, 50, ["!Hypervisor", "~ESXi, Hyper-V, Proxmox"], "d"),
    g.box(20, 160, 300, 50, ["!Hardware", "~a server"], "m"),
    g.box(360, 40, 92, 50, ["!VM", "~Windows"], "a"), g.box(464, 40, 92, 50, ["!VM", "~Ubuntu"], "a"), g.box(568, 40, 92, 50, ["!VM", "~Kali"], "a"),
    g.box(360, 100, 300, 50, ["!Hypervisor app", "~VirtualBox, VMware Workstation"], "d"),
    g.box(360, 160, 300, 50, ["!Host OS", "~Windows, macOS or Linux"]),
    g.box(360, 220, 300, 50, ["!Hardware", "~your PC or laptop"], "m"),
    g.text(170, 240, "Runs straight on the hardware.", "c s mu"),
    g.text(170, 256, "Data centres and the cloud use this.", "c s mu"),
    g.text(510, 292, "Runs as an app on your computer.", "c s mu"),
    g.text(510, 308, "Perfect for a home lab.", "c s mu"),
  ]),

  "homelab": (g) => g.svg(680, 296, [
    g.rect(10, 10, 540, 275, "n", 12),
    g.text(26, 34, "Your PC running VirtualBox", "b"),
    g.text(26, 52, "lab machines can't reach your home network", "s mu"),
    g.box(360, 30, 170, 66, ["!Router VM", "~pfSense or OPNsense", "`10.10.10.1"], "y"),
    g.box(575, 35, 95, 56, ["!Internet", "~updates only"], "m"),
    g.arrow(530, 63, 574, 63),
    g.text(552, 80, "NAT", "c s mu"),
    g.line(40, 165, 525, 165, "th"),
    g.text(40, 155, "Internal network lab-net · 10.10.10.0/24", "s mo ac"),
    g.line(445, 96, 445, 165),
    g.line(105, 165, 105, 192), g.line(275, 165, 275, 192), g.line(445, 165, 445, 192),
    g.box(30, 192, 150, 66, ["!DC01", "~Windows Server", "`10.10.10.10"], "a"),
    g.box(200, 192, 150, 66, ["!WS01", "~Windows 11", "`10.10.10.20"]),
    g.box(370, 192, 150, 66, ["!LNX01", "~Ubuntu Server", "`10.10.10.30"]),
  ]),
});
