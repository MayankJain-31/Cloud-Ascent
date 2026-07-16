/* ================= MODULES ================= */
const MODULES=[
 {id:"fund",  icon:"☁️", name:"Cloud Fundamentals", desc:"Cloud model, regions & zones, IaaS→Serverless", color:"var(--blue)"},
 {id:"gce",   icon:"🖥️", name:"Compute Engine", desc:"VMs, machine types, discounts, MIGs, load balancing", color:"var(--blue)"},
 {id:"app",   icon:"🚀", name:"App Platforms", desc:"App Engine · GKE · Cloud Functions · Cloud Run", color:"var(--green)"},
 {id:"stor",  icon:"💾", name:"Storage", desc:"Persistent Disk, Local SSD, Filestore, Cloud Storage", color:"var(--green)"},
 {id:"db",    icon:"🗄️", name:"Databases", desc:"Cloud SQL, Spanner, Firestore, Bigtable, BigQuery, Memorystore", color:"var(--yellow)"},
 {id:"net",   icon:"🌐", name:"Networking", desc:"VPC, subnets, firewall, CIDR, VPN, Interconnect, DNS", color:"var(--blue)"},
 {id:"iam",   icon:"🔐", name:"IAM & Org", desc:"Roles, service accounts, hierarchy, billing, policy", color:"var(--red)"},
 {id:"ops",   icon:"📊", name:"Operations", desc:"Monitoring, Logging, Trace, Debugger, Profiler", color:"var(--yellow)"},
 {id:"data",  icon:"📨", name:"Messaging & Data", desc:"Pub/Sub, Dataflow, Dataproc", color:"var(--green)"},
 {id:"tool",  icon:"🛠️", name:"Tooling & Deploy", desc:"gcloud, Deployment Manager, Foundation Toolkit, Marketplace", color:"var(--red)"},
];
const MODNAME=Object.fromEntries(MODULES.map(m=>[m.id,m.name]));

/* ================= CONCEPT PAGES ================= */
const CONCEPTS={
fund:[
 {t:"Cloud value & elasticity",stars:2,hy:false,
  purpose:"Rent compute/storage on demand instead of buying peak-load hardware up front.",
  why:"Data centers force PEAK-LOAD provisioning — you buy for the busiest hour and waste it the rest of the time. Cloud trades capital expense for variable expense.",
  how:["On-demand provisioning = scale up when needed, release when done (elasticity).","Benefit from economies of scale, stop guessing capacity, go global in minutes.","GCP is one of the top-3 providers; markets itself as the 'cleanest cloud' (net carbon-neutral)."],
  example:"An online shop provisions many VMs for Black Friday, then scales to a handful overnight — paying only for what runs.",
  tips:["Know the phrase: trade CAPEX for OPEX ('capital expense' for 'variable expense').","'Elasticity' = automatic scale up AND down."],
  traps:["Elasticity ≠ just scaling up; releasing resources matters for the exam.","'Availability' vs 'Scalability' are different — don't conflate."],
  notuse:"Steady, fully predictable, never-changing workloads may be cheaper on committed/reserved capacity than pure on-demand."},
 {t:"Regions & Zones",stars:3,hy:true,
  purpose:"Physical geography of GCP: pick where resources live for latency, availability, and compliance.",
  why:"A single data center = high latency for distant users + a single point of failure. Regions and zones let you spread risk.",
  how:["Region = specific geographic location (e.g. asia-south1 = Mumbai). 20+ regions.","Each region has 3+ Zones. A zone is one or more discrete clusters (distinct physical infra).","Zones in a region are connected by low-latency links.","Distribute across zones → survive a zone failure. Across regions → survive a region failure + lower global latency + meet data-residency law."],
  example:"asia-south1 has zones asia-south1-a, -b, -c. Put a MIG across all three for zonal fault tolerance.",
  tips:["⭐⭐⭐ Region code format: <continent-direction><number> e.g. us-west1, europe-north1.","Multi-region > region > zone for availability. Higher availability = higher cost.","Regulations/data residency is a valid reason to choose a specific region."],
  traps:["Zones are NOT independent regions — a full region outage takes all its zones.","Some resources are zonal (VM, PD), some regional (regional MIG/PD), some global (image, snapshot, VPC)."],
  notuse:"Don't multi-region a dev/test toy — you pay for redundancy you don't need."},
 {t:"IaaS · PaaS · CaaS · FaaS · Serverless",stars:3,hy:true,
  purpose:"The spectrum of how much Google manages vs how much you manage.",
  why:"Choosing the right abstraction is the single most common exam decision — more managed = less flexibility, less ops burden.",
  how:["IaaS (Compute Engine): you manage OS, patching, scaling, availability. Max control.","PaaS (App Engine): Google manages OS/runtime/scaling; you bring code + config.","CaaS (GKE, Cloud Run): you ship containers.","FaaS (Cloud Functions): you ship a function; runs on events.","Serverless = no infra visibility + scales to zero + pay-per-use (Functions, Cloud Run, App Engine Standard)."],
  example:"Same web app: on GCE you patch the OS; on App Engine Standard you just `gcloud app deploy` and it scales to zero.",
  tips:["⭐⭐⭐ 'No server management / pay per request / scale to zero' → Cloud Functions, Cloud Run, or App Engine Standard.","'Full control / legacy / specific OS or licensing' → Compute Engine.","'Containers without managing a cluster' → Cloud Run. 'Containers with cluster control' → GKE."],
  traps:["App Engine Flexible keeps ≥1 instance running (does NOT scale to zero); Standard does.","Serverless does NOT mean 'no servers' — it means you don't see/manage them."],
  notuse:"Don't force a legacy monolith needing a specific kernel onto App Engine Standard — use GCE or GKE."},
],
gce:[
 {t:"Compute Engine basics & machine families",stars:3,hy:true,
  purpose:"Provision and manage virtual machines (IaaS) on Google's infrastructure.",
  why:"The default answer whenever a scenario needs full OS control, specific licensing, or lift-and-shift.",
  how:["Machine families: E2/N2/N2D/N1 = General purpose (best price/perf); M2/M1 = Memory-optimized (large in-memory DBs); C2 = Compute-optimized (gaming, HPC).","Machine type e2-standard-2 → e2 family, standard workload, 2 vCPUs.","Custom Machine Types when predefined don't fit; billed per vCPU + memory.","Add GPUs for ML/graphics — needs GPU-library image, on-host-maintenance must be TERMINATE.","Images: public (Google/OSS) or custom (hardened, faster boot)."],
  example:"Lift-and-shift an on-prem Oracle box → e2/n2 VM with a persistent disk and the right OS image.",
  tips:["⭐⭐⭐ Machine type can only change on a STOPPED instance.","Custom images/hardened images reduce boot time + meet security standards.","Sole-tenant nodes = dedicated hardware for licensing/compliance."],
  traps:["You CANNOT change machine type while running.","GPUs not supported on shared-core or memory-optimized types."],
  notuse:"If you don't need OS control, a managed platform (App Engine/Run) is cheaper to operate."},
 {t:"IP addresses & Static IPs",stars:2,hy:true,
  purpose:"How VMs are reachable internally and from the internet.",
  why:"Common trap questions about losing IPs and billing for unused static IPs.",
  how:["Internal (private) IP: every VM gets one, internal to VPC.","External (public) IP: optional, internet-routable, unique globally.","Ephemeral external IP is LOST when the VM is stopped.","Static (reserved) external IP stays constant and can be moved to another VM in the project."],
  example:"A web server that must keep the same public IP across reboots → reserve a static external IP.",
  tips:["⭐⭐⭐ You are BILLED for a reserved static IP when it is NOT attached to a running instance — release it when unused.","Don't want internet exposure? Don't assign an external IP."],
  traps:["Stopping a VM loses an ephemeral IP but keeps the static one attached (you must manually detach)."],
  notuse:"Don't reserve static IPs you won't use — they cost money idle."},
 {t:"Pricing: Sustained · Committed · Spot/Preemptible",stars:3,hy:true,
  purpose:"The four ways to save money on Compute Engine.",
  why:"Cost-optimization questions almost always hinge on picking the right discount for the workload shape.",
  how:["Sustained use: AUTOMATIC discount for running a large % of the month (N1/N2). No action needed. NOT for E2/A2.","Committed use: commit 1 or 3 years for up to ~70% off — for predictable, steady workloads.","Preemptible VM: up to ~80% off, can be reclaimed anytime, max 24h runtime, 30s warning.","Spot VM: newer preemptible — same idea but NO 24h max runtime; 60–91% off."],
  example:"Fault-tolerant nightly batch job that can restart → Spot/Preemptible VMs. Always-on prod DB → committed use.",
  tips:["⭐⭐⭐ 'Predictable / steady / always-on' → Committed use. 'Fault-tolerant, not time-critical, cost-sensitive' → Spot/Preemptible.","Billed by the second after a 1-minute minimum; stopped VMs bill $0 compute but you still pay for attached disks."],
  traps:["Spot/Preemptible: no SLA, no auto-restart, no live migration, free-tier credits don't apply.","Sustained-use discounts do NOT apply to E2 or A2."],
  notuse:"Never run a stateful, must-stay-up service on Spot/Preemptible VMs."},
 {t:"Availability policy & Live Migration",stars:2,hy:false,
  purpose:"Keep VMs running through Google's host maintenance.",
  why:"Tested via GPU/preemptible edge cases.",
  how:["On host maintenance: MIGRATE (default, live-migrate to another host) or TERMINATE.","Automatic restart: restart the VM after a non-user crash (maintenance, hw failure).","Live migration NOT supported for GPUs or preemptible/spot VMs → those must be set to TERMINATE."],
  example:"GPU training VM → onHostMaintenance=TERMINATE, automaticRestart=on.",
  tips:["⭐ Default onHostMaintenance is MIGRATE for standard VMs.","GPUs force TERMINATE."],
  traps:["Preemptible/Spot cannot live-migrate."],
  notuse:"Don't rely on live migration for GPU workloads."},
 {t:"Managed Instance Groups (MIG)",stars:3,hy:true,
  purpose:"A group of identical VMs (from an instance template) managed as one unit.",
  why:"MIGs deliver autoscaling, autohealing, and zero-downtime rollouts — the backbone of scalable, resilient IaaS.",
  how:["Needs an instance template (immutable — copy+modify to change).","Autohealing = health check replaces failed instances.","Autoscaling on CPU %, LB utilization, or a Cloud Monitoring metric; set min/max, cool-down, scale-in controls.","Regional MIG spans zones → higher availability than zonal MIG.","Rolling update = gradual replace to a new template; canary = test new version on a subset.","Stateful MIG preserves instance name / disks / metadata for stateful apps."],
  example:"Web tier: regional MIG behind a load balancer, autoscale 2→10 on CPU 60%, rolling update for new releases.",
  tips:["⭐⭐⭐ 'Survive a zonal failure' → regional (multi-zone) MIG.","'Replace unhealthy instances automatically' → health check + autohealing.","'Release new version without downtime' → rolling update; test first → canary."],
  traps:["Unmanaged instance groups do NOT autoscale/autoheal — only use when VMs must differ.","Instance templates can't be edited — you copy and create a new one."],
  notuse:"Different-config VMs in one group → unmanaged group, but you lose all the managed features."},
 {t:"Cloud Load Balancing",stars:3,hy:true,
  purpose:"Distribute traffic across backends for availability, scale, and low latency.",
  why:"Picking the correct LB type from a scenario is a recurring exam task.",
  how:["Global External HTTP(S) LB: Layer 7, global, one anycast IP, host/path routing, cross-region.","SSL Proxy: global external TCP+SSL (SSL offload) for non-HTTP.","TCP Proxy: global external TCP without SSL offload.","External Network TCP/UDP LB: regional, pass-through, any port.","Internal HTTP(S) / Internal TCP-UDP LB: regional, private, inside the VPC.","SSL/TLS termination (offload) at the LB; LB→backend can be HTTP over Google's network."],
  example:"Global HTTPS site routing /api and /static to different backends across regions → Global External HTTP(S) LB.",
  tips:["⭐⭐⭐ 'Global HTTP(S) across regions' → External HTTP(S) LB.","'SSL termination for non-HTTP global TCP' → SSL Proxy.","'Internal-only traffic between tiers' → Internal LB.","Route by URL path/host → HTTP(S) LB host & path rules."],
  traps:["Network LB is regional + pass-through (no proxy, no path routing).","Only HTTP(S) LB does content-based (host/path) routing."],
  notuse:"Don't use a global HTTP(S) LB for purely internal microservice traffic — use an internal LB."},
],
app:[
 {t:"App Engine (Standard vs Flexible)",stars:3,hy:true,
  purpose:"Fully-managed PaaS to deploy and scale apps with minimal ops.",
  why:"Standard-vs-Flexible and scale-to-zero are frequent decision points.",
  how:["Standard: language sandboxes, scales to ZERO, fast (seconds) startup, rapid scaling, 1–10 min request timeout.","Flexible: runs in Docker on GCE VMs, any runtime, min 1 instance (no scale to zero), minutes to start, 60-min timeout, SSH for debug.","One App per project; App is REGION-locked (cannot move). Multiple Services, multiple Versions per service.","Traffic splitting for canary/A-B (by IP, cookie, or random). Deploy without shifting traffic via --no-promote.","dispatch.yaml = routing, cron.yaml = scheduled HTTP GET jobs, queue.yaml = task queues."],
  example:"Simple microservices in supported languages, must scale to zero to save cost → App Engine Standard.",
  tips:["⭐⭐⭐ 'Scale to zero + supported language' → Standard. 'Custom runtime / container / background processes' → Flexible.","Canary: gcloud app deploy --no-promote, then set-traffic --splits.","You CANNOT move an App Engine app to a different region — create a new project."],
  traps:["Flexible does NOT scale to zero and does NOT support 'basic' scaling.","Only ONE App Engine application per project."],
  notuse:"Need portable containers or fine-grained infra control → Cloud Run or GKE."},
 {t:"Google Kubernetes Engine (GKE)",stars:3,hy:true,
  purpose:"Managed Kubernetes for orchestrating containerized microservices.",
  why:"Service types and pod/node scaling appear repeatedly.",
  how:["Cluster = control plane (master) + worker nodes. Master runs API server, scheduler, controller-manager, etcd.","Pod = smallest deployable unit (1+ containers sharing network/IP/storage).","Deployment manages ReplicaSets → desired replica count + rolling releases. Service exposes pods with a stable IP.","Service types: ClusterIP (internal only), NodePort, LoadBalancer (one external LB per service), Ingress (one LB for many services).","HPA = pod autoscaling (kubectl autoscale). Cluster Autoscaler = node autoscaling (gcloud ... --enable-autoscaling).","ConfigMap = config, Secret = sensitive config. StatefulSet = stateful apps (Kafka/Redis). DaemonSet = one pod per node.","Cluster types: Zonal (single/multi-zone), Regional (replicated control plane), Private, Alpha. Node pools group same-type nodes; GKE Sandbox for untrusted code."],
  example:"Run 10 instances of service A + 15 of B with autoscaling and self-healing → GKE deployment + HPA + cluster autoscaler.",
  tips:["⭐⭐⭐ Internal-only communication between microservices → Service type ClusterIP.","One LB for many microservices (by path) → Ingress. Per-service external LB → LoadBalancer service.","Pod pending → can't be scheduled (insufficient resources). Pod waiting → image pull failure.","Untrusted 3rd-party code → new node pool with GKE Sandbox."],
  traps:["HPA scales pods; Cluster Autoscaler scales nodes — questions test which one you need.","GKE reserves some node CPU for the control plane."],
  notuse:"Simple single container with no cluster needs → Cloud Run is simpler and cheaper to run."},
 {t:"Cloud Functions (FaaS)",stars:2,hy:true,
  purpose:"Run small event-driven functions with zero server management.",
  why:"The go-to answer for 'run code when an event happens'.",
  how:["Triggered by: HTTP, Cloud Storage, Pub/Sub, Firestore, Firebase, Cloud Logging.","Pay per invocation + compute time + memory. Scales horizontally to zero.","Time-bound: default 1 min, MAX 60 min (3600s).","2nd gen (built on Cloud Run + Eventarc): longer timeouts, up to 16GiB/4vCPU, concurrency up to 1000 req/instance, traffic splitting, 90+ event types.","1st gen: 1 request per instance (cold starts). Set min-instances to reduce cold starts (higher cost)."],
  example:"Resize an image whenever a file lands in a bucket → Cloud Function triggered by Cloud Storage.",
  tips:["⭐⭐⭐ 'Run code in response to an event' → Cloud Functions.","Cold start pain → set minimum instances.","2nd gen supports concurrency; 1st gen is one-request-per-instance."],
  traps:["Not for long-running processes (max 60 min).","Event-driven glue, not a place to host a full web app."],
  notuse:"Long batch jobs or full always-on services → Cloud Run / GKE / GCE."},
 {t:"Cloud Run (Serverless containers)",stars:3,hy:true,
  purpose:"Deploy a container to production in seconds — serverless, no cluster.",
  why:"'Container + serverless + no cluster' is a common exam phrase.",
  how:["Fully managed, built on Knative. Scales to zero, pay per use (CPU, memory, requests, networking).","Any language/binary/dependency — just a container listening on a port.","Revisions + traffic splitting (gcloud run services update-traffic --to-revisions v2=10,v1=90).","Cloud Run for Anthos runs on your GKE/Anthos clusters (cloud, multi-cloud, on-prem)."],
  example:"Containerized REST API that must scale to zero between bursts with no cluster to manage → Cloud Run.",
  tips:["⭐⭐⭐ 'Container + serverless + no cluster + scale to zero' → Cloud Run.","Canary via revision traffic splitting.","Cloud Run vs GKE: Run = no cluster ops; GKE = full orchestration control."],
  traps:["Cloud Run needs a container listening on $PORT; Functions just needs a function.","Cloud Run (managed) vs Cloud Run for Anthos (on your clusters)."],
  notuse:"Complex multi-service orchestration, DaemonSets, node-level control → GKE."},
 {t:"Choosing a compute platform",stars:3,hy:true,
  purpose:"The master decision tree tying all compute options together.",
  why:"Most compute questions are decided by one keyword.",
  how:["Full OS control / legacy / licensing → Compute Engine (IaaS).","Kubernetes orchestration / advanced cluster control → GKE (CaaS).","Fully-managed app, supported languages, scale to zero → App Engine (PaaS).","Event-driven function → Cloud Functions (FaaS).","Container, serverless, no cluster → Cloud Run (CaaS serverless)."],
  example:"Read the scenario keywords: 'cluster'→GKE, 'event'→Functions, 'container no cluster'→Run, 'legacy VM'→GCE.",
  tips:["⭐⭐⭐ Memorize the keyword→service mapping; most compute questions are decided by one phrase."],
  traps:["App Engine Flexible also runs containers — but keeps ≥1 instance and is region-locked.","Cloud Run and Functions 2nd gen share the same backend."],
  notuse:"Match managed-ness to how much ops you can afford."},
],
stor:[
 {t:"Storage types: Block vs File vs Object",stars:2,hy:true,
  purpose:"Three fundamental storage shapes and their GCP products.",
  why:"Anchors the file-vs-object confusion.",
  how:["Block storage (like a hard disk): Persistent Disk, Local SSD. Attached to a VM.","File storage (shared file system): Filestore (NFSv3), shareable across many VMs.","Object storage (key→object): Cloud Storage — buckets & objects, REST access."],
  example:"Many VMs need a shared POSIX file share for media editing → Filestore.",
  tips:["⭐⭐ 'Shared file system / NFS across VMs' → Filestore.","'Store files/blobs/backups, access via API' → Cloud Storage.","'Disk for a VM' → Persistent Disk."],
  traps:["Cloud Storage is NOT a file system (no partial in-place edits — whole-object writes)."],
  notuse:"Don't use Cloud Storage where you need low-latency random block I/O — use a disk."},
 {t:"Persistent Disk vs Local SSD",stars:3,hy:true,
  purpose:"Two block-storage options for VMs with very different durability.",
  why:"The Local SSD ephemerality trap is high-frequency.",
  how:["Persistent Disk (PD): network block storage, durable, lifecycle independent of VM, resizable live, supports snapshots. Zonal (1 zone) or Regional (2 zones).","PD types: pd-standard (HDD, cheap, big-data sequential), pd-balanced (SSD, cost/perf balance), pd-ssd (SSD, high random IOPS, transactional).","Local SSD: physically attached, extremely fast (10–100× PD), but EPHEMERAL — data lost when VM stops/terminates; can't detach; no snapshots; encryption keys not configurable."],
  example:"Scratch/cache needing max IOPS where data loss is OK → Local SSD. Durable DB volume → pd-ssd.",
  tips:["⭐⭐⭐ 'Very high IOPS + data can be lost' → Local SSD. 'Durable, snapshot-able, movable' → Persistent Disk.","Improve PD performance → increase size, add disks, or add vCPUs.","Increase durability → Regional PD (2× cost, replicated across 2 zones)."],
  traps:["Local SSD data does NOT survive a stop — huge exam trap.","You can only INCREASE PD size, never shrink. Attach a disk only to a VM in the SAME zone."],
  notuse:"Never put a primary database on Local SSD."},
 {t:"Snapshots, Images & Machine Images",stars:2,hy:true,
  purpose:"Back up and clone disks and whole VMs.",
  why:"Snapshot vs image vs machine image is a classic distinction question.",
  how:["Snapshot = point-in-time backup of a PD; incremental; can be scheduled + auto-deleted; multi-regional/regional; shareable across projects.","Image = created from a boot disk; used to launch new VMs; global.","Machine Image = created from a whole VM instance — captures config, metadata, permissions, and ALL attached disks. Best for backup/clone/replication."],
  example:"Back up a VM with several data disks in one artifact → Machine Image. Standardize new VM launches → custom Image.",
  tips:["⭐⭐ 'Back up a VM + all its disks together' → Machine Image.","'Repeatedly create disks from one snapshot' → make an Image from the snapshot first.","Take snapshots during off-peak; snapshots are incremental (deleting one won't lose others' data)."],
  traps:["Snapshot = one disk. Machine Image = whole VM (multi-disk). Custom Image = boot disk only.","Don't take snapshots more than once per hour."],
  notuse:"Don't use a single-disk snapshot to back up a multi-disk VM."},
 {t:"Cloud Storage — buckets, objects, classes",stars:3,hy:true,
  purpose:"Serverless, infinitely-scalable object storage with 11 nines durability.",
  why:"Storage-class selection is one of the most common cost questions.",
  how:["Bucket names are GLOBALLY unique; lowercase/number/hyphen/underscore/dot; can't start with 'goog' or contain 'google'.","Max object 5TB, unlimited objects. Access control per object.","Storage classes (same API, same 11-nines durability): Standard (hot, no min duration), Nearline (30-day min, ~monthly access), Coldline (90-day min, ~quarterly), Archive (365-day min, <yearly).","Object Lifecycle Management: rules (Age, CreatedBefore, NumberOfNewerVersions...) → SetStorageClass or Delete. Transitions only go colder.","Object Versioning prevents accidental deletion (keeps noncurrent versions). Always encrypted at rest; Google-managed / CMEK (Cloud KMS) / customer-supplied keys.","Signed URL = time-limited access without a Google account. Can host a static website (bucket name = DNS name, allUsers = Storage Object Viewer)."],
  example:"Regulatory logs kept for years, almost never read → Archive class + lifecycle rule.",
  tips:["⭐⭐⭐ Access ~monthly → Nearline; ~quarterly → Coldline; <yearly → Archive; hot → Standard.","Speed up huge uploads → parallel composite uploads. Temporary access to one object → Signed URL.","CLI is gsutil / gcloud storage."],
  traps:["Minimum storage durations: 30/90/365 days — early deletion still bills the minimum.","Lifecycle transitions can't go to a hotter class.","Bucket names are global, not per-project."],
  notuse:"Frequently-updated small records → a database, not object storage."},
],
db:[
 {t:"DB concepts: availability, durability, RTO/RPO, consistency",stars:2,hy:false,
  purpose:"The vocabulary behind every database-choice question.",
  why:"RPO/RTO wording appears in backup/DR questions.",
  how:["Availability = % of time reachable (4 nines ≈ 4.5 min/month down). Durability = data survives long-term (11 nines).","RPO = max acceptable DATA loss (drives backup/replication frequency). RTO = max acceptable DOWNTIME (drives failover strategy).","Strong consistency = every read sees the latest write (synchronous replication). Eventual consistency = brief lag (async), used for scale (social feeds).","Read replicas offload read traffic; standby enables failover."],
  example:"'Lose at most 1 minute of data' = RPO 1 min. 'Back up online with least performance impact' → take snapshots from a read replica/standby.",
  tips:["⭐⭐ RPO = data loss window, RTO = downtime window — don't swap them.","Reporting is slowing the prod DB → add a read replica."],
  traps:["Availability ≠ durability. RPO ≠ RTO."],
  notuse:"Don't demand strong global consistency where eventual is fine — it costs scale."},
 {t:"Cloud SQL vs Cloud Spanner",stars:3,hy:true,
  purpose:"The two managed RELATIONAL (OLTP) options.",
  why:"The most-confused relational pair on the exam.",
  how:["Cloud SQL: managed MySQL/PostgreSQL/SQL Server. REGIONAL, up to ~64TB, 99.95% HA (primary+standby, automatic failover). Read replicas (cross-zone/region/external). Point-in-time recovery via binary logging. Vertical scale only for writes.","Cloud Spanner: globally-distributed relational, horizontal scale for reads AND writes, 99.999% availability, strong consistency at global scale, PB scale, automatic sharding. Expensive (pay per node + storage)."],
  example:"Lift a MySQL app to the cloud, few TB, single region → Cloud SQL. Global financial ledger, millions of TPS, 5 nines → Spanner.",
  tips:["⭐⭐⭐ Use Spanner when: huge relational volume, need horizontal WRITE scaling, global, or 99.999% availability. Otherwise Cloud SQL.","Cloud SQL HA = primary + standby (NOT a read replica — standby can't serve reads)."],
  traps:["Cloud SQL scales writes VERTICALLY only; read replicas offload reads, not writes.","Spanner is costly — don't pick it for a small single-region app."],
  notuse:"Don't put Spanner under a small app; don't expect global horizontal write scale from Cloud SQL."},
 {t:"Firestore/Datastore vs Bigtable",stars:3,hy:true,
  purpose:"The two NoSQL options — small transactional documents vs massive wide-column.",
  why:"Firestore↔Bigtable is the most-confused NoSQL pair.",
  how:["Firestore (Datastore mode): serverless NoSQL DOCUMENT DB, ACID transactions, indexes, GQL. Best 0→few TB, mobile/web, flexible schema (user profiles, catalogs). Firestore adds strong consistency + offline mobile sync.","Bigtable: petabyte-scale wide-column NoSQL, millions of reads/writes per sec at ms latency, single-row transactions only. NOT serverless (you create instances/nodes). For IoT streams, time-series, analytics, financial ticks."],
  example:"IoT sensors streaming millions of events/sec, time-series → Bigtable. App user profiles with quickly-evolving schema → Firestore.",
  tips:["⭐⭐⭐ 'Huge volume / IoT / time-series / millions TPS' → Bigtable. 'Flexible schema, small-medium, mobile' → Firestore.","Bigtable CLI = cbt (not gcloud). Firestore/Datastore export only via gcloud."],
  traps:["Bigtable is NOT serverless — you size nodes.","Firestore/Datastore don't do joins or aggregate SUM/COUNT the way SQL does.","Bigtable = single-row transactions only."],
  notuse:"Don't use Bigtable for small transactional apps; don't use Firestore for petabyte analytics streams."},
 {t:"BigQuery & Memorystore",stars:3,hy:true,
  purpose:"Analytics data warehouse (OLAP) and in-memory cache.",
  why:"OLAP-vs-OLTP and 'cache' scenarios.",
  how:["BigQuery: serverless, exabyte-scale, columnar, SQL data WAREHOUSE (OLAP). Query external sources (GCS, Cloud SQL, Bigtable, Drive). Priced by data SCANNED — estimate with --dry-run + pricing calculator. CLI = bq.","OLTP = row storage (many small transactions). OLAP = columnar storage (analytics over huge datasets).","Memorystore: managed Redis/Memcached in-memory. Sub-ms latency. Use for caching, session store, leaderboards. Memcached=caching; Redis=persistence+HA."],
  example:"Analyze petabytes of historical data with SQL, no servers → BigQuery. Cache DB query results for a web app → Memorystore.",
  tips:["⭐⭐⭐ 'Analytics / data warehouse / SQL over huge data' → BigQuery. 'Cache / microsecond access' → Memorystore.","BigQuery cost = bytes scanned; --dry-run to estimate before running."],
  traps:["BigQuery is OLAP, not a transactional DB — don't use it for OLTP.","BigQuery/Datastore/Firestore need NO VM config; Cloud SQL and Bigtable DO."],
  notuse:"Don't run OLTP on BigQuery or analytics on Cloud SQL."},
 {t:"Database decision cheat-sheet",stars:3,hy:true,
  purpose:"One table to route any database scenario.",
  why:"These six mappings answer most DB questions.",
  how:["Relational + regional + small/medium → Cloud SQL.","Relational + global + horizontal write scale + 5 nines → Cloud Spanner.","NoSQL document + flexible schema + mobile/web → Firestore.","NoSQL wide-column + huge IoT/time-series/analytics stream → Bigtable.","Analytics/data-warehouse SQL over petabytes → BigQuery.","In-memory cache / microsecond latency → Memorystore."],
  example:"Match the keyword: 'global relational'→Spanner, 'time-series'→Bigtable, 'warehouse'→BigQuery, 'cache'→Memorystore.",
  tips:["⭐⭐⭐ These 6 mappings answer the majority of database questions on the ACE."],
  traps:["Spanner vs Cloud SQL and Bigtable vs Firestore are the two most-confused pairs."],
  notuse:"Wrong DB = wrong answer; anchor on scale + shape + consistency."},
],
net:[
 {t:"VPC & Subnets",stars:3,hy:true,
  purpose:"Your private, isolated software-defined network in GCP.",
  why:"VPC=global / subnet=regional is tested directly.",
  how:["VPC is a GLOBAL resource; subnets are REGIONAL. Traffic in a VPC is isolated from other VPCs.","Auto-mode VPC: a subnet auto-created in every region (default VPC). Custom-mode: you define subnets + IP ranges (recommended for prod).","Public subnet = resources reachable from internet; private subnet = not internet-reachable but can talk to public-subnet resources.","Private Google Access lets VMs with only internal IPs reach Google APIs. VPC Flow Logs for troubleshooting.","You can EXPAND a subnet's CIDR range (secondary ranges)."],
  example:"Prod network with tightly controlled IP plan across regions → custom-mode VPC with hand-defined subnets.",
  tips:["⭐⭐⭐ VPC = global, Subnet = regional. Instances are zonal within a subnet's region.","Default VPC is auto-mode; production prefers custom-mode."],
  traps:["A subnet spans a whole region (all its zones), not a single zone.","Reserved ranges (e.g. 0.0.0.0/8, 127.0.0.0/8) can't be subnet CIDRs."],
  notuse:"Don't use auto-mode for production where you need a controlled address plan."},
 {t:"CIDR blocks",stars:2,hy:true,
  purpose:"Express a range of IP addresses for subnets and firewall rules.",
  why:"Simple CIDR math shows up.",
  how:["Notation start/prefix: 10.0.0.0/24. The /N = first N bits fixed → 2^(32-N) addresses.","/24 = 256 addresses, /28 = 16, /30 = 4, /32 = 1 address, /0 = all addresses.","Private ranges (RFC1918): 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16."],
  example:"/26 → 2^(32-26)=64 addresses. 0.0.0.0/0 in a firewall source = 'from anywhere on the internet'.",
  tips:["⭐⭐ Memorize: /24=256, /28=16, /30=4, /32=1. Smaller number after / = more addresses."],
  traps:["0.0.0.0/0 (all) vs 0.0.0.0/32 (one address) — classic distractor."],
  notuse:"Don't overlap subnet CIDRs within a VPC."},
 {t:"Firewall rules",stars:3,hy:true,
  purpose:"Stateful control of traffic in/out of the VPC.",
  why:"Priority and default-deny/allow are tested.",
  how:["Stateful; each rule has priority 0 (highest) → 65535 (lowest).","Implied rules (priority 65535): allow all egress, deny all ingress — can't delete, can override with priority 0–65534.","Default VPC extras (65534): allow internal, allow SSH(22), allow RDP(3389), allow ICMP.","Rule fields: direction (ingress/egress), target (all / tag / service account), source or destination (CIDR / tag / SA), protocol, port, action (allow/deny), priority, enforcement.","Apply to specific VMs via network TAGS or service accounts."],
  example:"Allow HTTP(80) only to web VMs → ingress allow tcp:80, target = network tag 'web', source 0.0.0.0/0.",
  tips:["⭐⭐⭐ Lower priority number wins. Default = deny ingress / allow egress.","Scope rules to instances using network tags or service accounts.","Allow HTTP to a VM → configure a firewall rule (not just an external IP)."],
  traps:["Priority 0 is the HIGHEST priority, 65535 the lowest.","Ingress is denied by default; egress is allowed by default."],
  notuse:"Don't open 0.0.0.0/0 on admin ports (22/3389) in production."},
 {t:"Shared VPC vs VPC Peering",stars:2,hy:true,
  purpose:"Two ways to connect networks/projects privately.",
  why:"Central admin (Shared VPC) vs decentralized (Peering).",
  how:["Shared VPC: one HOST project shares its VPC subnets with SERVICE projects in the SAME organization. Central network admin. Separation of duties.","VPC Peering: connect two VPCs (same/different projects, even different orgs) via internal IPs. Efficient (Google backbone), no egress charges between them. Network admin is NOT shared — each side manages its own."],
  example:"Central networking team owns the VPC, app teams deploy into it → Shared VPC. Two independent orgs need private connectivity → VPC Peering.",
  tips:["⭐⭐ Shared VPC = same org, one host project, centralized. Peering = any orgs, decentralized admin."],
  traps:["Peering does NOT share admin roles across VPCs.","Shared VPC needs a Shared VPC Admin at org/folder level."],
  notuse:"Don't use peering to centralize network administration — that's Shared VPC's job."},
 {t:"Cloud VPN · Interconnect · Cloud NAT · Cloud DNS",stars:2,hy:true,
  purpose:"Connect on-prem to GCP and manage egress/DNS.",
  why:"VPN vs Interconnect and NAT egress are common.",
  how:["Cloud VPN: IPSec tunnel over the public internet. HA VPN (99.99%, 2 IPs, dynamic BGP) or Classic VPN (99.9%, static or BGP). Low bandwidth.","Cloud Interconnect: dedicated PHYSICAL high-bandwidth link. Dedicated (10/100 Gbps) or Partner (50 Mbps–10 Gbps). Private, reduces egress cost. For high bandwidth.","Cloud NAT: lets private (no external IP) instances reach the internet for egress, without exposing them to inbound.","Cloud DNS: global managed DNS; public and private zones; managed via record-sets transactions."],
  example:"Reliable low-cost link to a small branch office → Cloud VPN. 10 Gbps private link to a data center → Dedicated Interconnect.",
  tips:["⭐⭐ 'Encrypted tunnel over internet' → Cloud VPN. 'High-bandwidth dedicated physical link' → Interconnect.","Private VMs need outbound internet (patches) but no inbound → Cloud NAT.","HA VPN = 99.99% and requires dynamic (BGP) routing."],
  traps:["VPN traffic rides the public internet; Interconnect is private.","Cloud NAT is for EGRESS only — it does not allow inbound connections."],
  notuse:"Don't use VPN when you need consistent high bandwidth — use Interconnect."},
],
iam:[
 {t:"IAM model: Member · Role · Policy",stars:3,hy:true,
  purpose:"How access is granted in GCP: who can do what on which resource.",
  why:"The foundation of every IAM question.",
  how:["Member (WHO): Google account, service account, Google group, Workspace/Cloud Identity domain, allAuthenticatedUsers, allUsers.","Role (WHAT): a bundle of PERMISSIONS. Permissions are never granted directly to members — always through a role.","Policy: binds Role → Member(s) (with optional conditions: time, resource, IP). Set at org/folder/project/resource level.","Three role types: Basic (Owner/Editor/Viewer — legacy, avoid in prod), Predefined (fine-grained, Google-managed, e.g. roles/storage.objectViewer), Custom (your own when predefined don't fit)."],
  example:"Give a teammate upload/delete on one bucket → bind roles/storage.objectAdmin to their account (member) via a policy.",
  tips:["⭐⭐⭐ Permissions attach to members THROUGH roles, never directly.","Prefer predefined over basic roles (least privilege). Use Groups to manage many users.","Policy = role + member(s) [+ condition]."],
  traps:["Basic roles (Owner/Editor/Viewer) are too broad for production.","IAM Role in GCP ≠ AWS Role — don't map concepts across clouds."],
  notuse:"Don't hand out Editor/Owner when a predefined role fits."},
 {t:"IAM vs Organization Policy vs ACL",stars:2,hy:true,
  purpose:"Three overlapping controls that answer different questions.",
  why:"WHO vs WHAT vs per-object.",
  how:["IAM = WHO can take actions on resources (identity-centric).","Organization Policy Service = WHAT can be done, org-wide constraints (e.g. disable SA creation, restrict resource regions). Needs Organization Policy Administrator.","ACLs (Cloud Storage) = per-OBJECT access, finer than bucket-level IAM. Use IAM for uniform bucket access; ACLs to customize individual objects. Access granted if EITHER IAM OR ACL allows."],
  example:"Block VM creation outside europe across the whole org → Organization Policy constraint.",
  tips:["⭐⭐ IAM = who. Org Policy = what's allowed org-wide. ACL = per-object in GCS.","Uniform bucket-level access = IAM only; fine-grained = IAM + ACLs."],
  traps:["Org Policy focuses on WHAT, IAM on WHO — don't confuse.","A user gets GCS access if IAM OR ACL grants it (union)."],
  notuse:"Don't use ACLs for uniform bucket permissions — use bucket-level IAM."},
 {t:"Service Accounts",stars:3,hy:true,
  purpose:"Non-human identity for applications and VMs to call Google APIs.",
  why:"VM→API and cross-project SA scenarios recur.",
  how:["Identified by an email; no password; has RSA key-pairs; can't log in via browser.","Types: Default (auto-created, has Editor by default — NOT recommended), User-managed (recommended, least privilege), Google-managed.","VM → GCP service: attach a service account to the VM (Google-managed keys, auto-rotated, no key files). Do NOT delete an SA used by a running instance.","On-prem → GCP (long-lived): create user-managed SA key, download JSON key, set GOOGLE_APPLICATION_CREDENTIALS, use client libraries (ADC).","On-prem → short-lived: OAuth2 access tokens / OpenID Connect ID tokens (less risky than sharing keys).","A service account is BOTH an identity (you attach roles to it) AND a resource (others get roles ON it)."],
  example:"App on a VM needs to read a bucket → attach a user-managed SA with roles/storage.objectViewer to the VM.",
  tips:["⭐⭐⭐ Cross-project: in Project B, grant the Project-A VM's service account the needed role on B's resource.","Attaching an SA to a VM uses Google-managed, auto-rotated keys — no key files to leak.","serviceAccountUser role lets a member attach/run as that SA."],
  traps:["Default SA has Editor — over-privileged; create user-managed SAs.","Deleting an SA breaks running instances that use it."],
  notuse:"Don't hand out downloaded SA key files when attaching an SA to a VM would work."},
 {t:"Resource hierarchy & Billing",stars:2,hy:true,
  purpose:"How resources are organized and paid for.",
  why:"Inheritance + billing roles are tested.",
  how:["Hierarchy: Organization → Folder → Project → Resources. IAM policy set at any level is INHERITED downward (union with lower levels). You can't restrict at a lower level what's granted above.","Best practice: separate projects per environment (dev/prod), folders per department, one project per app per environment.","Billing account is mandatory to create billable resources; one billing account can fund many projects; can be self-serve or invoiced.","Budgets + alerts (default 50/90/100%), export billing to BigQuery (analyze) or Cloud Storage (archive)."],
  example:"Isolate prod from dev → separate projects; grant devs full access to dev only, ops to prod.",
  tips:["⭐⭐ IAM inherits DOWN the hierarchy (Org→Folder→Project→Resource).","Create project + link existing billing account → Project Creator + Billing Account User.","Analyze spend → export billing to BigQuery."],
  traps:["You cannot revoke at a child what a parent granted — inheritance is additive.","Billing Account Administrator manages but CANNOT create billing accounts (that's Billing Account Creator)."],
  notuse:"Don't grant broad access high in the hierarchy expecting to claw it back below."},
 {t:"Key IAM predefined roles",stars:2,hy:false,
  purpose:"High-frequency named roles the exam quotes.",
  why:"Separation-of-duties questions cite exact roles.",
  how:["Storage: Storage Admin (buckets+objects), Storage Object Admin (objects only, no bucket create), Object Creator, Object Viewer.","Compute: Compute Admin, Compute Instance Admin, Network Admin, Security Admin (firewalls+certs), Compute Viewer, OS Login.","App Engine: Deployer (deploy versions, no traffic shift), Service Admin (shift traffic, no deploy) — separation of duties.","BigQuery: Data Viewer/Editor/Owner (no jobs), Job User (run queries), User (view + run). Need Data Viewer OR User to SEE data.","Billing: Account Creator, Account Administrator (manage, not create), Account User (link projects), Viewer."],
  example:"Deployer + Service Admin split lets one person deploy and another shift traffic — separation of duties.",
  tips:["⭐⭐ Storage Object Admin can manage objects but NOT create buckets (Storage Admin can).","App Engine Deployer deploys but can't move traffic; Service Admin moves traffic but can't deploy.","BigQuery Job User only runs jobs; you also need Data Viewer/User to read data."],
  traps:["Object Admin ≠ Storage Admin (bucket creation).","BigQuery Data Owner has no job/query permission by itself."],
  notuse:"Don't grant Admin where Object Admin or Viewer suffices."},
],
ops:[
 {t:"Cloud Monitoring",stars:2,hy:true,
  purpose:"Metrics, dashboards, and alerting across GCP (and AWS).",
  why:"The memory-agent trap is common.",
  how:["Metrics → dashboards + alerting policies (condition + notification channels + docs).","Workspace groups monitoring for multiple projects / AWS accounts (host project + added projects).","VM default metrics: CPU, some disk, network, uptime. Install the Monitoring AGENT to get MEMORY and DISK-SPACE utilization + more."],
  example:"Alert when CPU > 80% for 5 min → Monitoring alerting policy with a condition + email channel.",
  tips:["⭐⭐ Memory & disk-space utilization need the Cloud Monitoring AGENT (not default).","A Workspace can monitor multiple projects at once."],
  traps:["Memory usage is NOT collected by default — agent required."],
  notuse:"Don't expect memory metrics without installing the agent."},
 {t:"Cloud Logging & Audit Logs",stars:3,hy:true,
  purpose:"Store, search, and route logs; audit who did what.",
  why:"Data Access vs Admin Activity and export sinks are frequent.",
  how:["Logs Explorer, dashboards, log-based metrics, Log Router (sinks).","VM logs need the Logging AGENT (fluentd-based). Managed services (GKE/App Engine/Run) log automatically.","Cloud Audit Logs: Admin Activity (config changes, always on, free), Data Access (reads/data — OFF by default, must enable), System Event (Google actions), Policy Denied.","Log buckets: _Required (400-day, admin+system+access-transparency, free, can't change) and _Default (30-day, editable retention up to 3650 days).","Export via sinks: Cloud Storage (archive/compliance, cheapest), BigQuery (SQL analysis), Pub/Sub (stream to elsewhere)."],
  example:"Retain audit logs cheaply for external auditors → export sink to Cloud Storage + grant auditors Object Viewer.",
  tips:["⭐⭐⭐ 'Who did what, when' → Cloud Audit Logs (Admin Activity always on; Data Access must be enabled).","Long-term cheap retention → sink to Cloud Storage. SQL analysis of logs → sink to BigQuery.","Record all object operations in a bucket → enable Data Access audit logging."],
  traps:["Data Access audit logs are OFF by default; Admin Activity is always on.","VM app logs need the Logging agent installed."],
  notuse:"Don't rely on default logging for VM-internal app logs without the agent."},
 {t:"Trace · Debugger · Profiler · Error Reporting",stars:2,hy:false,
  purpose:"Application performance and error tooling.",
  why:"Matching tool to symptom.",
  how:["Cloud Trace: distributed tracing — request latency across microservices.","Cloud Debugger: inspect running app state / snapshot variables in production without stopping or adding logs.","Cloud Profiler: continuous low-overhead CPU/memory profiling to find bottlenecks.","Error Reporting: aggregates and surfaces exceptions/errors in real time."],
  example:"Find which microservice adds latency to a request → Cloud Trace. Surface top production exceptions → Error Reporting.",
  tips:["⭐⭐ Trace = latency across services. Debugger = live state, no redeploy. Profiler = CPU/mem bottlenecks. Error Reporting = aggregated exceptions."],
  traps:["Trace vs Profiler: Trace = request latency path; Profiler = resource consumption."],
  notuse:"Don't add logging statements to prod when Debugger can snapshot state live."},
],
data:[
 {t:"Pub/Sub",stars:3,hy:true,
  purpose:"Reliable, scalable, fully-managed asynchronous messaging to decouple services.",
  why:"Decoupling + fan-out subscription behavior are tested.",
  how:["Publisher → Topic → Subscription(s) → Subscriber. Decoupling, availability, scalability, durability.","Delivery: Pull (subscriber polls) or Push (Pub/Sub POSTs to a webhook endpoint).","Each subscription gets its own copy of every message; multiple subscribers on ONE subscription share/split the messages (load-balance).","Messages retained per subscription until ACKed. Optional ordering, filtering, ack-deadline.","Backbone for streaming analytics: Pub/Sub → Dataflow → BigQuery."],
  example:"Web servers drop log events on a topic; a logging service consumes them at its own pace → decoupled, resilient.",
  tips:["⭐⭐⭐ 'Decouple / async / ingest streaming events at scale' → Pub/Sub.","Fan-out (every consumer gets all messages) → one subscription each. Load-balance → many subscribers on one subscription."],
  traps:["Multiple subscribers on the SAME subscription split messages; separate subscriptions each get a full copy.","Pub/Sub is not for synchronous request/response."],
  notuse:"Don't use Pub/Sub for tight synchronous calls between two services."},
 {t:"Dataflow vs Dataproc",stars:2,hy:true,
  purpose:"Two data-processing engines: managed Beam vs managed Spark/Hadoop.",
  why:"New pipeline vs migrate-existing decision.",
  how:["Cloud Dataflow: serverless, autoscaling, unified STREAM + BATCH pipelines. Based on Apache Beam. Pre-built templates (Pub/Sub→BigQuery, GCS→Bigtable, format conversion). Real-time fraud/sensor/log processing.","Cloud Dataproc: managed SPARK & HADOOP clusters. NOT serverless (you create clusters). Use to LIFT-AND-SHIFT existing Spark/Hadoop jobs, or ML/AI with OSS frameworks. Can use preemptible workers to cut cost."],
  example:"New streaming ETL from Pub/Sub to BigQuery → Dataflow. Move existing Hadoop/Spark jobs to the cloud → Dataproc.",
  tips:["⭐⭐ 'New serverless stream/batch pipeline' → Dataflow. 'Existing Spark/Hadoop migration' → Dataproc.","Dataflow is serverless; Dataproc you size clusters (use preemptibles to save)."],
  traps:["Dataproc is NOT serverless. Dataflow does both streaming and batch."],
  notuse:"Don't stand up Dataproc for a brand-new pipeline that Dataflow can run serverlessly."},
],
tool:[
 {t:"gcloud & service CLIs",stars:3,hy:true,
  purpose:"Command-line control of GCP.",
  why:"Which-CLI questions and region precedence.",
  how:["Structure: gcloud GROUP SUBGROUP ACTION (e.g. gcloud compute instances list).","gcloud init (auth+config), gcloud config set project/compute-region/zone, gcloud config configurations create/activate (multiple profiles).","Region/zone precedence: command flag (--zone) > local config (gcloud config set) > project metadata.","Service-specific CLIs (NOT gcloud): gsutil (Cloud Storage, now gcloud storage), bq (BigQuery), cbt (Bigtable), kubectl (Kubernetes workloads)."],
  example:"Switch between dev and prod projects quickly → gcloud config configurations create/activate.",
  tips:["⭐⭐⭐ Cloud Storage = gsutil / gcloud storage; BigQuery = bq; Bigtable = cbt; K8s workloads = kubectl.","--zone on the command overrides config which overrides project metadata."],
  traps:["Don't use gcloud for object copy — that's gsutil / gcloud storage. Bigtable uses cbt, not gcloud.","kubectl manages workloads; gcloud manages the GKE cluster itself."],
  notuse:"Don't reach for the console when a repeatable gcloud command is asked for."},
 {t:"Deployment Manager & Foundation Toolkit",stars:2,hy:false,
  purpose:"Infrastructure as Code and enterprise landing zones.",
  why:"IaC benefits and repeatability.",
  how:["Deployment Manager: GCP-native IaC in YAML (+ Jinja2/Python templates). Understands dependencies, automatic rollback on error, version-controlled, free (pay for resources).","Cloud Foundation Toolkit: ready-made Terraform modules + end-to-end samples + Config Connector (manage GCP via Kubernetes manifests) + Policy Library (org-policy guardrails)."],
  example:"Repeatably stand up the same VPC+VMs+DB across 4 environments → Deployment Manager (or Terraform via CFT).",
  tips:["⭐ IaC = repeatable, no config drift, version-controlled. Always modify DM-created resources through DM.","Config Connector = manage GCP resources with kubectl instead of Terraform."],
  traps:["Don't hand-edit resources created by Deployment Manager — update the config."],
  notuse:"Don't click-ops production infra you need to reproduce."},
 {t:"Marketplace · Pricing Calculator",stars:1,hy:false,
  purpose:"Deploy prebuilt stacks and estimate costs.",
  why:"Quick one-click stacks and non-binding estimates.",
  how:["Cloud Marketplace (Launcher): one-click deploy of commercial/OSS stacks (WordPress, SAP HANA, Jenkins) with their infra.","Pricing Calculator: estimate cost of a GCP solution across 40+ services. Estimates are NOT binding."],
  example:"Stand up WordPress (VM + DB) quickly → Cloud Marketplace.",
  tips:["⭐ Marketplace bundles the whole stack; Pricing Calculator gives non-binding estimates."],
  traps:["Pricing Calculator numbers are estimates, not guarantees."],
  notuse:"Don't hand-build a common stack Marketplace already packages."},
],
};

/* ================= COMPARISON TABLES ================= */
const COMPARISONS=[
 {id:"compute",title:"Compute: GCE vs Cloud Run vs GKE vs App Engine vs Functions",hy:true,
  cols:["","Compute Engine","App Engine","GKE","Cloud Run","Cloud Functions"],
  rows:[
   ["Model","IaaS","PaaS","CaaS","CaaS (serverless)","FaaS (serverless)"],
   ["You ship","VM/OS","Code + config","Containers + cluster","A container","A function"],
   ["Scale to zero","No","Standard: yes / Flex: no","No (nodes)","Yes","Yes"],
   ["Cluster to manage","—","No","Yes","No","No"],
   ["Best for","Legacy, licensing, full control","Simple web apps","Microservice orchestration","Containers, no cluster","Event-driven glue"],
   ["Exam keyword","'full control','specific OS'","'scale to zero','managed lang'","'cluster','Kubernetes'","'container','no cluster'","'event','trigger'"],
  ],
  note:"Read the scenario for ONE keyword — it usually decides the platform."},
 {id:"db",title:"Databases: SQL vs Spanner vs Bigtable vs Firestore vs BigQuery",hy:true,
  cols:["","Cloud SQL","Spanner","Firestore","Bigtable","BigQuery"],
  rows:[
   ["Type","Relational OLTP","Relational OLTP (global)","NoSQL document","NoSQL wide-column","Analytics (OLAP)"],
   ["Scope","Regional","Global","Regional/multi","Zonal cluster","Serverless global"],
   ["Scale","Vertical (writes)","Horizontal R+W","Auto, 0→few TB","PB, millions TPS","Exabyte"],
   ["Consistency","Strong","Strong global","Strong","Row-level","—"],
   ["Serverless","No","No (nodes)","Yes","No (nodes)","Yes"],
   ["Best for","MySQL/PG lift-shift","Global ledger, 5-nines","Mobile/web profiles","IoT/time-series","SQL warehouse"],
  ],
  note:"Most-confused pairs: SQL↔Spanner (global + horizontal writes ⇒ Spanner) and Firestore↔Bigtable (huge stream ⇒ Bigtable)."},
 {id:"storage",title:"Cloud Storage classes",hy:true,
  cols:["Class","Min duration","Access pattern","Use case"],
  rows:[
   ["Standard","None","Frequent / hot","Websites, active data"],
   ["Nearline","30 days","~ once a month","Backups read monthly"],
   ["Coldline","90 days","~ once a quarter","Disaster recovery"],
   ["Archive","365 days","< once a year","Compliance/legal archive"],
  ],
  note:"Same API + 11-nines durability across all. Lifecycle transitions only go COLDER. Early delete still bills the minimum duration."},
 {id:"block",title:"Persistent Disk vs Local SSD",hy:false,
  cols:["","Persistent Disk","Local SSD"],
  rows:[
   ["Attachment","Network drive","Physically attached"],
   ["Durability","Durable","Ephemeral (lost on stop)"],
   ["Lifecycle","Independent of VM","Tied to VM"],
   ["Speed","Lower","10–100× PD"],
   ["Snapshots","Yes","No"],
   ["Detach/move","Yes","No"],
   ["Use","Permanent storage","Scratch/cache, max IOPS"],
  ],
  note:"pd-standard (HDD, cheap) / pd-balanced / pd-ssd (high IOPS). Regional PD = 2 zones, ~2× cost, higher durability."},
 {id:"lb",title:"Load Balancers",hy:false,
  cols:["LB","Scope","Layer","Notes"],
  rows:[
   ["External HTTP(S)","Global","L7 proxy","Host/path routing, one anycast IP"],
   ["SSL Proxy","Global","L4 proxy","TCP + SSL offload (non-HTTP)"],
   ["TCP Proxy","Global","L4 proxy","TCP, no SSL offload"],
   ["External Network TCP/UDP","Regional","L4 pass-through","Any port, no proxy"],
   ["Internal HTTP(S) / TCP-UDP","Regional","Internal","Private, inside VPC"],
  ],
  note:"Only HTTP(S) LB does content (host/path) routing. Internal LB for tier-to-tier private traffic."},
 {id:"iam",title:"IAM vs Organization Policy vs ACL",hy:false,
  cols:["","IAM","Organization Policy","ACL (GCS)"],
  rows:[
   ["Answers","WHO can act","WHAT is allowed org-wide","Per-object access"],
   ["Scope","Member → role","Constraints on resources","Individual objects"],
   ["Example","Grant objectViewer","Restrict resource regions","Make one object public"],
  ],
  note:"Access to a GCS object is granted if IAM OR ACL allows (union). Uniform bucket access = IAM only."},
 {id:"net",title:"VPN vs Interconnect · NAT vs VPN · Shared VPC vs Peering",hy:false,
  cols:["Pair","Option A","Option B"],
  rows:[
   ["On-prem link","Cloud VPN — IPSec over internet, low bandwidth, 99.9/99.99%","Interconnect — dedicated physical, high bandwidth, private"],
   ["Private egress","Cloud NAT — private VMs reach internet outbound only","Cloud VPN — connect networks, not egress-to-internet"],
   ["Connect projects","Shared VPC — same org, one host project, central admin","VPC Peering — any orgs, decentralized admin"],
  ],
  note:"NAT = outbound only (no inbound exposure). HA VPN = 99.99% + dynamic BGP."},
 {id:"msg",title:"Pub/Sub vs Cloud Tasks (and Dataflow vs Dataproc)",hy:false,
  cols:["","Pub/Sub","Cloud Tasks"],
  rows:[
   ["Pattern","Fan-out event stream","Per-task async execution control"],
   ["Consumers","Many subscribers","Explicit task handler"],
   ["Use","Decouple, streaming ingest","Rate-limited background jobs"],
  ],
  note:"Dataflow = serverless Beam (stream+batch, new pipelines). Dataproc = managed Spark/Hadoop (migrate existing jobs)."},
];

/* ================= QUESTION BANK ================= */
const Q=[
{m:"fund",topic:"Regions & Zones",d:1,ty:"mcq",hy:true,
 q:"Which statement about GCP regions and zones is correct?",
 opts:["A zone is a group of regions","A region contains three or more zones connected by low-latency links","Zones are always in different countries","A region is smaller than a zone"],a:1,
 ex:"A region is a geographic location containing 3+ zones, and zones within a region are linked by low-latency connections — letting you build high availability inside one region.",
 wy:{0:"It's the reverse — a region contains zones, not the other way around.",2:"Zones in a region are in the same geographic area, not different countries.",3:"A region is larger — it is made up of multiple zones."},
 trick:"Zone ⊂ Region ⊂ Multi-region. Higher level = higher availability + cost."},
{m:"fund",topic:"High availability",d:2,ty:"scenario",hy:true,
 q:"Your app runs in a single zone and must survive a zone failure with minimal effort. What is the simplest change?",
 opts:["Deploy the app across multiple zones in the same region","Move to a bigger machine type","Enable a static IP","Switch to a preemptible VM"],a:0,
 ex:"Spreading instances across multiple zones in one region protects against a single-zone outage — the standard, lowest-effort HA pattern (e.g., a regional MIG).",
 wy:{1:"A larger VM adds capacity, not fault tolerance across zones.",2:"A static IP fixes the address, not availability.",3:"Preemptible VMs are LESS reliable — they can be reclaimed."},
 trick:"'Survive a zone failure' → multi-zone. 'Survive a region failure' → multi-region."},
{m:"fund",topic:"Serverless",d:2,ty:"mcq",hy:true,
 q:"Which characteristic best defines a fully 'serverless' (level-2) service on GCP?",
 opts:["It has no servers at all","You pay for provisioned instances even when idle","It scales to zero and you pay per request/invocation","It always keeps one instance running"],a:2,
 ex:"True serverless means no infra to manage, automatic scaling to zero when idle, and pay-per-use (Cloud Functions, Cloud Run, App Engine Standard).",
 wy:{0:"Servers still exist — you just don't see or manage them.",1:"That's the opposite of serverless billing.",3:"Keeping one instance always on (App Engine Flexible) is level-1, not full serverless."},
 trick:"App Engine Flexible does NOT scale to zero; Standard does."},
{m:"fund",topic:"Cloud value",d:1,ty:"mcq",hy:false,
 q:"A key financial advantage of cloud computing is that it lets you:",
 opts:["Trade variable expense for capital expense","Trade capital expense for variable expense","Eliminate all costs","Avoid paying for any storage"],a:1,
 ex:"Cloud converts big up-front capital purchases (CAPEX) into pay-as-you-go operating expense (OPEX) that tracks actual usage.",
 wy:{0:"That's backwards.",2:"You still pay for what you use.",3:"Storage is billed."},
 trick:"CAPEX → OPEX is the canonical phrasing."},

{m:"gce",topic:"Machine type change",d:2,ty:"trouble",hy:true,
 q:"You need to change a running VM from e2-standard-2 to e2-standard-8. What must you do?",
 opts:["Change it live from the console","Stop the instance, then change the machine type, then start it","Delete and recreate the VM","Create a snapshot and restore to a bigger type"],a:1,
 ex:"Machine type can only be changed while the instance is STOPPED. Stop → change type → start. No data is lost (the boot disk persists).",
 wy:{0:"You cannot resize a running instance.",2:"Deleting is unnecessary and risky.",3:"A snapshot works but is far more work than a simple stop/resize."},
 trick:"'Resize a running VM' is always a trap — you must stop it first."},
{m:"gce",topic:"Spot/Preemptible",d:2,ty:"cost",hy:true,
 q:"A nightly batch job is fault-tolerant, not time-critical, and cost is the priority. Which VM saves the most money?",
 opts:["Committed-use N2 VMs","On-demand C2 VMs","Spot (preemptible) VMs","Sole-tenant nodes"],a:2,
 ex:"Spot/Preemptible VMs give 60–91% off and are ideal for fault-tolerant, restartable, non-urgent batch work — exactly this profile.",
 wy:{0:"Committed use fits always-on predictable workloads, not restartable batch.",1:"On-demand is the most expensive option here.",3:"Sole-tenant is for licensing/compliance, not cost savings."},
 trick:"'Fault-tolerant + not time-critical + cheap' = Spot/Preemptible almost every time."},
{m:"gce",topic:"Committed use",d:2,ty:"cost",hy:true,
 q:"You run a production database VM 24/7 with steady, predictable load for years. Best discount?",
 opts:["Preemptible VMs","Committed use discount","Sustained use only","Spot VMs"],a:1,
 ex:"Committed-use discounts (1 or 3 years) give up to ~70% off for predictable, always-on workloads like a steady prod DB.",
 wy:{0:"Preemptible can be reclaimed — unacceptable for a prod DB.",2:"Sustained-use applies automatically but discounts less than a commitment.",3:"Spot is reclaimable — wrong for always-on."},
 trick:"'Predictable / steady / always-on' → committed use."},
{m:"gce",topic:"Static IP billing",d:2,ty:"trouble",hy:true,
 q:"You reserved a static external IP but detached it from all VMs. Why are you still being charged?",
 opts:["Static IPs are always free","You are billed for a reserved static IP that is NOT in use","External IPs never cost money","Only internal IPs are billed"],a:1,
 ex:"GCP bills for reserved static external IPs that are NOT attached to a running resource, to discourage hoarding. Release it to stop charges.",
 wy:{0:"Static IPs cost money.",2:"External IPs can be billed.",3:"Internal IPs are free; external reserved ones are billed when idle."},
 trick:"Reserved-but-idle static IP = you pay. Ephemeral IP is lost on stop."},
{m:"gce",topic:"MIG availability",d:2,ty:"arch",hy:true,
 q:"You want your MIG-managed web app to survive a full zone outage. What should you use?",
 opts:["A zonal MIG with more instances","A regional (multi-zone) MIG","An unmanaged instance group","A single large VM"],a:1,
 ex:"A regional MIG spreads instances across multiple zones in the region, so a single-zone failure doesn't take down the service.",
 wy:{0:"A zonal MIG lives in ONE zone — a zone outage kills it.",2:"Unmanaged groups have no autohealing/autoscaling.",3:"One VM is a single point of failure."},
 trick:"'Survive zonal failure for a MIG' → regional MIG."},
{m:"gce",topic:"Autohealing",d:2,ty:"trouble",hy:true,
 q:"Instances in your MIG sometimes hang but stay 'running', so traffic still hits them. How do you auto-replace unhealthy ones?",
 opts:["Enable a health check on the MIG (autohealing)","Increase the machine type","Use a static IP","Switch to an unmanaged group"],a:0,
 ex:"Autohealing uses an application-level health check; instances that fail it are automatically recreated, even if the VM is technically 'running'.",
 wy:{1:"Bigger machines don't detect app-level hangs.",2:"IPs are unrelated.",3:"Unmanaged groups can't autoheal."},
 trick:"'Running but unhealthy' → health check + autohealing, not VM status."},
{m:"gce",topic:"Load balancer choice",d:2,ty:"arch",hy:true,
 q:"You need to route global HTTPS traffic to backends in multiple regions and send /api and /static to different backend services. Which load balancer?",
 opts:["External Network TCP/UDP LB","Internal TCP/UDP LB","Global External HTTP(S) LB","SSL Proxy LB"],a:2,
 ex:"Only the Global External HTTP(S) LB is global, terminates HTTPS, and supports host/path (content-based) routing across multi-region backends.",
 wy:{0:"Network LB is regional and pass-through — no path routing.",1:"Internal LB is private, not internet-facing.",3:"SSL Proxy is for non-HTTP TCP+SSL, no URL path routing."},
 trick:"Content/path routing = HTTP(S) LB only."},
{m:"gce",topic:"GPU maintenance",d:3,ty:"trouble",hy:false,
 q:"Your GPU training VM keeps failing during Google host maintenance. What is the required availability setting?",
 opts:["onHostMaintenance = MIGRATE","onHostMaintenance = TERMINATE with automatic restart on","Enable live migration for GPUs","Use a preemptible GPU VM"],a:1,
 ex:"GPUs cannot live-migrate, so onHostMaintenance must be TERMINATE, with automaticRestart enabled so the VM comes back after maintenance.",
 wy:{0:"MIGRATE is unsupported for GPUs.",2:"Live migration isn't available for GPU VMs.",3:"Preemptible makes it worse — it can be reclaimed."},
 trick:"GPUs + preemptibles cannot live-migrate → TERMINATE."},

{m:"app",topic:"App Engine scaling",d:2,ty:"scenario",hy:true,
 q:"You want a fully-managed platform for a Python web app that scales to zero when idle to minimize cost. Which service/environment?",
 opts:["App Engine Flexible","App Engine Standard","Compute Engine MIG","GKE"],a:1,
 ex:"App Engine Standard runs supported languages in a sandbox and scales all the way to zero, so you pay nothing when there's no traffic.",
 wy:{0:"Flexible keeps at least one instance running — it does NOT scale to zero.",2:"A MIG needs min instances and VM management.",3:"GKE requires managing a cluster."},
 trick:"'Scale to zero + managed language' → App Engine Standard, NOT Flexible."},
{m:"app",topic:"Cloud Run",d:2,ty:"scenario",hy:true,
 q:"You have a containerized REST API and want serverless deployment that scales to zero WITHOUT managing a Kubernetes cluster. Best choice?",
 opts:["GKE","Cloud Run","App Engine Flexible","Compute Engine"],a:1,
 ex:"Cloud Run runs any container serverlessly, scales to zero, and requires no cluster — the ideal fit for a container that just needs to serve requests.",
 wy:{0:"GKE means managing a cluster.",2:"App Engine Flexible doesn't scale to zero and is region-locked.",3:"Compute Engine is full IaaS with ops overhead."},
 trick:"'Container + serverless + no cluster' → Cloud Run."},
{m:"app",topic:"Cloud Functions",d:1,ty:"scenario",hy:true,
 q:"You want to automatically generate a thumbnail every time an image is uploaded to a Cloud Storage bucket. Best service?",
 opts:["A cron job on a VM","Cloud Functions triggered by Cloud Storage","App Engine Standard","Bigtable"],a:1,
 ex:"Cloud Functions run code in response to events; a Cloud Storage finalize trigger fires the function on each upload — no servers to manage.",
 wy:{0:"A VM cron polls and wastes resources; not event-driven.",2:"App Engine hosts apps, not lightweight event handlers.",3:"Bigtable is a database, not compute."},
 trick:"'Run code when an event happens' → Cloud Functions."},
{m:"app",topic:"GKE service type",d:2,ty:"trouble",hy:true,
 q:"Two microservices in your GKE cluster must communicate ONLY internally, never exposed to the internet. Which Service type?",
 opts:["LoadBalancer","NodePort","ClusterIP","Ingress"],a:2,
 ex:"ClusterIP exposes a Service on an internal cluster IP only — perfect for intra-cluster microservice communication with no external exposure.",
 wy:{0:"LoadBalancer provisions an external LB — publicly reachable.",1:"NodePort opens a port on every node's IP — externally reachable.",3:"Ingress fronts external HTTP traffic."},
 trick:"'Internal only' → ClusterIP. External per-service → LoadBalancer. One LB for many → Ingress."},
{m:"app",topic:"GKE pod troubleshooting",d:2,ty:"trouble",hy:true,
 q:"A pod is stuck in 'Pending'. What is the most likely cause?",
 opts:["The container image can't be pulled","The pod can't be scheduled onto a node (insufficient resources)","The service account is missing","The load balancer is misconfigured"],a:1,
 ex:"'Pending' typically means the scheduler can't place the pod — usually not enough CPU/memory on any node. Adding nodes or enabling cluster autoscaling resolves it.",
 wy:{0:"Image-pull failure shows as 'Waiting'/ImagePullBackOff, not Pending.",2:"SA issues surface differently.",3:"LB config doesn't block scheduling."},
 trick:"Pending = can't schedule (resources). Waiting = can't pull image."},
{m:"app",topic:"GKE autoscaling",d:2,ty:"mcq",hy:true,
 q:"Which pair correctly separates pod scaling from node scaling in GKE?",
 opts:["HPA scales nodes; Cluster Autoscaler scales pods","HPA scales pods; Cluster Autoscaler scales nodes","Both scale nodes","Both scale pods"],a:1,
 ex:"Horizontal Pod Autoscaler adds/removes pods based on metrics; Cluster Autoscaler adds/removes nodes when pods can't be scheduled or nodes are underused.",
 wy:{0:"Reversed.",2:"HPA is about pods.",3:"Cluster Autoscaler is about nodes."},
 trick:"HPA = pods, Cluster Autoscaler = nodes."},
{m:"app",topic:"Compute selection",d:2,ty:"scenario",hy:true,
 q:"A team must migrate a legacy app that requires a specific OS kernel and custom drivers. Which platform?",
 opts:["App Engine Standard","Cloud Functions","Compute Engine","Cloud Run"],a:2,
 ex:"Compute Engine gives full control of the OS and kernel — required for legacy software with specific driver/kernel needs.",
 wy:{0:"Standard sandboxes runtimes — no kernel control.",1:"Functions run short event handlers.",3:"Cloud Run runs containers but not arbitrary kernels/drivers."},
 trick:"'Specific OS / kernel / licensing / full control' → Compute Engine."},
{m:"app",topic:"App Engine deploy",d:3,ty:"scenario",hy:false,
 q:"You want to deploy a new App Engine version but send it NO traffic yet, then gradually shift 10% to it. Which commands?",
 opts:["gcloud app deploy (auto-promotes), then delete old","gcloud app deploy --no-promote, then gcloud app services set-traffic --splits","gcloud run deploy --tag","kubectl set image"],a:1,
 ex:"--no-promote deploys the version without routing traffic; set-traffic --splits then shifts a controlled percentage (canary).",
 wy:{0:"Default deploy promotes immediately — no canary.",2:"That's Cloud Run.",3:"That's Kubernetes."},
 trick:"Canary on App Engine = --no-promote + set-traffic splits."},

{m:"stor",topic:"Storage class",d:2,ty:"cost",hy:true,
 q:"You must retain compliance logs for 7 years and expect to access them less than once a year. Cheapest class?",
 opts:["Standard","Nearline","Coldline","Archive"],a:3,
 ex:"Archive is the lowest-cost class for data accessed < once a year, with a 365-day minimum storage duration — ideal for long-term compliance archives.",
 wy:{0:"Standard is for hot, frequently-accessed data.",1:"Nearline suits ~monthly access.",2:"Coldline suits ~quarterly access."},
 trick:"<1/yr→Archive, ~quarterly→Coldline, ~monthly→Nearline, hot→Standard."},
{m:"stor",topic:"Lifecycle",d:2,ty:"cost",hy:true,
 q:"Objects are hot for 30 days then rarely touched. How do you automatically cut storage cost over time?",
 opts:["Manually move files each month","Object Lifecycle Management rule: SetStorageClass to Nearline/Coldline by age","Delete and re-upload","Enable versioning"],a:1,
 ex:"A lifecycle rule based on object age can automatically transition objects to colder classes (or delete them) with no manual work.",
 wy:{0:"Manual movement doesn't scale.",2:"Delete/re-upload loses data and effort.",3:"Versioning protects against deletion, it doesn't reduce cost."},
 trick:"Lifecycle transitions can only go COLDER, never back to hot."},
{m:"stor",topic:"Local SSD durability",d:2,ty:"trouble",hy:true,
 q:"You stored important data on a Local SSD. After stopping the VM, the data is gone. Why?",
 opts:["Local SSDs are network storage","Local SSD data is ephemeral and lost when the VM stops/terminates","The disk was too small","Snapshots deleted it"],a:1,
 ex:"Local SSDs are physically attached and EPHEMERAL — their contents do not survive a VM stop or terminate. Use Persistent Disks for durable data.",
 wy:{0:"Local SSDs are physically attached, not network.",2:"Size is irrelevant to durability.",3:"Local SSDs don't support snapshots."},
 trick:"Local SSD = fast but ephemeral. Never store primary data there."},
{m:"stor",topic:"Persistent Disk",d:2,ty:"trouble",hy:true,
 q:"Your database on a persistent disk needs more IOPS. Which action does NOT help?",
 opts:["Increase the persistent disk size","Use pd-ssd instead of pd-standard","Increase the VM's vCPUs","Shrink the disk to a smaller size"],a:3,
 ex:"PD performance scales with size, disk type (SSD), and VM vCPUs. You also CANNOT shrink a persistent disk — only increase — so this is both wrong and impossible.",
 wy:{0:"Larger PDs get more IOPS.",1:"pd-ssd gives higher random IOPS.",2:"More vCPUs raise the PD performance cap."},
 trick:"PDs can only grow, never shrink. Performance scales with size + type + vCPUs."},
{m:"stor",topic:"Machine Image",d:2,ty:"scenario",hy:true,
 q:"You must back up a VM together with its configuration and ALL attached data disks in a single artifact. What do you create?",
 opts:["A disk snapshot","A custom image","A machine image","An instance template"],a:2,
 ex:"A Machine Image captures the whole VM: config, metadata, permissions, and all attached disks — the right choice for full-VM backup/clone.",
 wy:{0:"A snapshot backs up ONE disk only.",1:"A custom image is the boot disk only.",3:"A template defines config for new VMs but stores no disk data."},
 trick:"Snapshot = 1 disk. Custom image = boot disk. Machine image = whole VM + all disks."},
{m:"stor",topic:"Filestore",d:2,ty:"scenario",hy:true,
 q:"Several VMs need a shared POSIX file system (NFS) for a media-editing workflow. Which service?",
 opts:["Cloud Storage","Filestore","Persistent Disk","Local SSD"],a:1,
 ex:"Filestore provides managed NFSv3 shared file storage that many VMs can mount concurrently — built for shared file workflows like media editing.",
 wy:{0:"Cloud Storage is object storage, not a mountable file system.",2:"A PD attaches to one VM (writes), not a shared NFS.",3:"Local SSD is single-VM ephemeral scratch."},
 trick:"'Shared NFS across many VMs' → Filestore."},
{m:"stor",topic:"Signed URL",d:2,ty:"scenario",hy:true,
 q:"You must give an external partner WITHOUT a Google account time-limited download access to one object. What do you use?",
 opts:["Make the bucket public","A Signed URL","Grant them Storage Admin","VPC Peering"],a:1,
 ex:"A Signed URL grants time-limited access to a specific object without requiring a Google account — precisely this use case.",
 wy:{0:"Public exposes everything to everyone.",2:"Storage Admin is massive over-permission and needs a Google identity.",3:"Peering is networking, unrelated."},
 trick:"'Temporary access, no Google account, single object' → Signed URL."},
{m:"stor",topic:"Large upload",d:2,ty:"scenario",hy:false,
 q:"You must upload a single 100 GB file to Cloud Storage as fast as possible. Best technique?",
 opts:["Simple upload","Parallel composite upload","Resumable upload only","Streaming transfer"],a:1,
 ex:"Parallel composite uploads split the file into chunks uploaded in parallel, greatly speeding large transfers when network/disk aren't the bottleneck.",
 wy:{0:"Simple upload is for small files.",2:"Resumable helps reliability, not raw parallel speed.",3:"Streaming is for unknown-size data."},
 trick:"'Speed up a huge upload' → parallel composite upload."},

{m:"db",topic:"Spanner vs SQL",d:2,ty:"scenario",hy:true,
 q:"You need a globally-distributed relational database with horizontal scaling for reads AND writes and 99.999% availability. Which service?",
 opts:["Cloud SQL","Cloud Spanner","Bigtable","Firestore"],a:1,
 ex:"Cloud Spanner is the only managed relational DB offering global distribution, horizontal read+write scaling, strong consistency, and 99.999% availability.",
 wy:{0:"Cloud SQL is regional and scales writes only vertically.",2:"Bigtable is NoSQL wide-column, not relational.",3:"Firestore is NoSQL document, not relational."},
 trick:"'Global relational + horizontal writes + 5 nines' → Spanner."},
{m:"db",topic:"Cloud SQL fit",d:2,ty:"scenario",hy:true,
 q:"You're lifting a single-region MySQL app (a few hundred GB) to GCP with minimal changes. Which managed DB?",
 opts:["Cloud Spanner","Cloud SQL","Bigtable","BigQuery"],a:1,
 ex:"Cloud SQL is managed MySQL/PostgreSQL/SQL Server, ideal for a regional lift-and-shift of an existing MySQL app without re-architecting.",
 wy:{0:"Spanner is overkill/expensive for a small single-region app.",2:"Bigtable isn't relational.",3:"BigQuery is analytics, not OLTP."},
 trick:"Regional relational + moderate size + lift-shift → Cloud SQL."},
{m:"db",topic:"Bigtable fit",d:2,ty:"scenario",hy:true,
 q:"An IoT platform ingests millions of time-series writes per second at millisecond latency. Which database?",
 opts:["Cloud SQL","Firestore","Cloud Bigtable","Memorystore"],a:2,
 ex:"Bigtable is a petabyte-scale wide-column NoSQL store built for very high-throughput, low-latency time-series/IoT and analytics workloads.",
 wy:{0:"Cloud SQL can't sustain millions of TPS.",1:"Firestore targets small-medium document workloads.",3:"Memorystore is a cache, not durable time-series storage."},
 trick:"'IoT / time-series / millions TPS / huge volume' → Bigtable."},
{m:"db",topic:"Firestore fit",d:2,ty:"scenario",hy:true,
 q:"A mobile app needs a flexible-schema database with offline sync and strong consistency for user profiles. Which service?",
 opts:["Bigtable","Firestore","BigQuery","Cloud SQL"],a:1,
 ex:"Firestore is a serverless NoSQL document DB with flexible schema, strong consistency, and native mobile/web client libraries with offline sync.",
 wy:{0:"Bigtable is for huge streams, not mobile document sync.",2:"BigQuery is analytics.",3:"Cloud SQL has a fixed relational schema and no offline mobile sync."},
 trick:"'Mobile / flexible schema / offline sync' → Firestore."},
{m:"db",topic:"BigQuery fit",d:2,ty:"scenario",hy:true,
 q:"Analysts must run SQL over petabytes of historical data with no servers to manage. Which service?",
 opts:["Cloud SQL","BigQuery","Bigtable","Memorystore"],a:1,
 ex:"BigQuery is a serverless, columnar, exabyte-scale data warehouse (OLAP) designed for SQL analytics over massive datasets.",
 wy:{0:"Cloud SQL is OLTP and won't scale to petabyte analytics.",2:"Bigtable lacks full SQL analytics.",3:"Memorystore is an in-memory cache."},
 trick:"'Analytics / warehouse / SQL over petabytes' → BigQuery."},
{m:"db",topic:"BigQuery cost",d:3,ty:"cost",hy:true,
 q:"You want to estimate the cost of a BigQuery query BEFORE running it. What do you do?",
 opts:["Run it and check the bill","Use --dry-run to see bytes scanned, then the pricing calculator","Query costs are fixed monthly","Enable caching"],a:1,
 ex:"BigQuery on-demand pricing is based on bytes SCANNED. A --dry-run reports the scanned bytes without running the query, which you multiply via the pricing calculator.",
 wy:{0:"Running it incurs the cost you're trying to estimate.",2:"On-demand BigQuery isn't a flat monthly fee.",3:"Caching helps repeat queries, not first-run estimation."},
 trick:"BigQuery cost = bytes scanned; estimate with --dry-run."},
{m:"db",topic:"Read replica",d:2,ty:"trouble",hy:true,
 q:"Reporting queries are slowing your production Cloud SQL instance. How do you offload them cheaply?",
 opts:["Vertically scale to a huge instance","Add a read replica and point reporting at it","Switch to Bigtable","Delete old data"],a:1,
 ex:"A read replica serves read-heavy reporting traffic separately, protecting the primary's performance without a costly vertical upgrade.",
 wy:{0:"Vertical scaling is expensive and may not isolate read load.",2:"Switching DB engines is a major re-architecture.",3:"Deleting data doesn't isolate reporting load."},
 trick:"'Reporting slows prod DB' → read replica."},
{m:"db",topic:"Cloud SQL HA",d:3,ty:"trouble",hy:false,
 q:"You configured a Cloud SQL HA (regional) setup and now try to send read queries to the standby. It fails. Why?",
 opts:["The standby is only for automatic failover, not for serving reads","HA isn't supported in Cloud SQL","You need to enable binary logging","Standbys are read-only replicas"],a:0,
 ex:"In Cloud SQL HA, the standby exists purely for automatic failover — it does NOT serve read traffic. For reads, add a read replica instead.",
 wy:{1:"Cloud SQL does support HA.",2:"Binary logging enables PITR/replicas, not standby reads.",3:"The standby is not a readable replica."},
 trick:"HA standby = failover only; use a read replica to offload reads."},
{m:"db",topic:"Memorystore",d:1,ty:"scenario",hy:false,
 q:"You need sub-millisecond caching of database query results and session data for a web app. Which service?",
 opts:["BigQuery","Memorystore (Redis)","Cloud SQL","Firestore"],a:1,
 ex:"Memorystore provides managed Redis/Memcached in-memory storage with sub-millisecond latency — ideal for caching and session stores.",
 wy:{0:"BigQuery is an analytics warehouse.",2:"Cloud SQL is disk-based OLTP, not sub-ms cache.",3:"Firestore is a document DB."},
 trick:"'Cache / microsecond latency / session store' → Memorystore."},

{m:"net",topic:"VPC scope",d:1,ty:"mcq",hy:true,
 q:"Which statement about VPC networks and subnets is correct?",
 opts:["VPC is regional; subnets are global","VPC is global; subnets are regional","Both are zonal","Both are global"],a:1,
 ex:"A VPC network is a GLOBAL resource, while each subnet belongs to a single REGION (spanning all its zones).",
 wy:{0:"Reversed.",2:"Neither is zonal.",3:"Subnets are regional, not global."},
 trick:"VPC = global, Subnet = regional, Instance = zonal."},
{m:"net",topic:"CIDR math",d:2,ty:"mcq",hy:true,
 q:"How many IP addresses does the CIDR block 10.0.0.0/28 contain?",
 opts:["4","16","32","256"],a:1,
 ex:"/28 fixes 28 of 32 bits, leaving 4 host bits: 2^(32-28) = 2^4 = 16 addresses.",
 wy:{0:"That would be /30.",2:"That would be /27.",3:"That would be /24."},
 trick:"Addresses = 2^(32 − prefix). /24=256, /28=16, /30=4, /32=1."},
{m:"net",topic:"Firewall priority",d:2,ty:"trouble",hy:true,
 q:"Two firewall rules match the same traffic: an ALLOW at priority 1000 and a DENY at priority 100. Which wins?",
 opts:["The ALLOW (higher number)","The DENY (priority 100 — lower number = higher priority)","Neither","Both apply"],a:1,
 ex:"Lower priority number = HIGHER precedence. Priority 100 beats 1000, so the DENY wins.",
 wy:{0:"Higher number is LOWER priority.",2:"One rule does apply.",3:"Only the highest-priority matching rule takes effect."},
 trick:"Firewall priority: 0 = highest, 65535 = lowest. Lower number wins."},
{m:"net",topic:"Firewall defaults",d:2,ty:"mcq",hy:true,
 q:"By default (implied rules), what does a VPC do with ingress and egress traffic?",
 opts:["Allow all ingress, deny all egress","Deny all ingress, allow all egress","Deny both","Allow both"],a:1,
 ex:"The implied rules (priority 65535) DENY all ingress and ALLOW all egress. You add higher-priority rules to open ingress.",
 wy:{0:"Reversed.",2:"Egress is allowed by default.",3:"Ingress is denied by default."},
 trick:"Default: ingress DENY, egress ALLOW."},
{m:"net",topic:"Cloud NAT",d:2,ty:"scenario",hy:true,
 q:"Private VMs with no external IP must download OS patches from the internet but must NOT accept inbound connections. What do you use?",
 opts:["Assign external IPs","Cloud NAT","Cloud VPN","A public load balancer"],a:1,
 ex:"Cloud NAT lets instances without external IPs make OUTBOUND internet connections (like patch downloads) while remaining unreachable from the internet.",
 wy:{0:"External IPs expose them to inbound traffic — the opposite of the requirement.",2:"VPN connects networks, not general internet egress.",3:"An LB accepts inbound traffic."},
 trick:"Cloud NAT = outbound-only internet for private VMs."},
{m:"net",topic:"On-prem link",d:2,ty:"scenario",hy:true,
 q:"You need a dedicated 10 Gbps PRIVATE connection between your data center and GCP for consistent high bandwidth. Which service?",
 opts:["Cloud VPN","Dedicated Interconnect","Cloud NAT","Direct Peering only"],a:1,
 ex:"Dedicated Interconnect provides a dedicated physical link (10/100 Gbps) with private, high-bandwidth, lower-egress-cost connectivity to GCP.",
 wy:{0:"VPN runs over the public internet — bandwidth isn't guaranteed high.",2:"NAT is for egress from private VMs.",3:"Direct Peering is a lower-level, not-recommended option; Interconnect is preferred."},
 trick:"High bandwidth + private + dedicated → Interconnect. Encrypted over internet → VPN."},
{m:"net",topic:"Shared VPC",d:2,ty:"scenario",hy:true,
 q:"A central networking team must own one VPC while several app teams (separate projects in the SAME org) deploy into it. What do you use?",
 opts:["VPC Peering","Shared VPC (host + service projects)","Cloud VPN","Separate VPCs per project"],a:1,
 ex:"Shared VPC lets a host project share its subnets with service projects in the same organization, giving the network team central control (separation of duties).",
 wy:{0:"Peering connects VPCs but doesn't centralize admin.",2:"VPN is for on-prem/remote connectivity.",3:"Separate VPCs don't share one network."},
 trick:"Same org + central network admin → Shared VPC. Cross-org private link → Peering."},
{m:"net",topic:"Allow HTTP",d:1,ty:"trouble",hy:false,
 q:"You created a web server VM with an external IP but can't reach it on port 80. What is most likely missing?",
 opts:["A firewall rule allowing ingress tcp:80","A static IP","A load balancer","Cloud DNS"],a:0,
 ex:"Ingress is denied by default. You must add a firewall rule allowing tcp:80 (often scoped by a network tag) for HTTP to reach the VM.",
 wy:{1:"A static IP fixes the address, not connectivity.",2:"An LB isn't required to reach one VM.",3:"DNS resolves names, not port access."},
 trick:"Can't reach a service port → check firewall rules first."},

{m:"iam",topic:"IAM model",d:1,ty:"mcq",hy:true,
 q:"In GCP IAM, how do members receive permissions?",
 opts:["Permissions are assigned directly to members","Through roles bound to members via a policy","Only via ACLs","Automatically by project"],a:1,
 ex:"Permissions are always packaged into ROLES; a policy binds a role to a member. You never grant a raw permission directly to a member.",
 wy:{0:"You cannot attach individual permissions directly.",2:"ACLs are a GCS-specific extra, not the core model.",3:"Access isn't automatic."},
 trick:"Member ← (policy binding) ← Role ← permissions."},
{m:"iam",topic:"Least privilege",d:2,ty:"scenario",hy:true,
 q:"A user must only upload and delete objects in ONE bucket. Which role follows least privilege?",
 opts:["Project Editor","roles/storage.admin","roles/storage.objectAdmin on that bucket","Owner"],a:2,
 ex:"Storage Object Admin lets a member fully manage OBJECTS (create/delete) without the ability to create/delete buckets — scoped to the one bucket, this is least privilege.",
 wy:{0:"Editor is far too broad.",1:"Storage Admin also allows bucket create/delete — more than needed.",3:"Owner is the broadest role possible."},
 trick:"Object Admin = objects only; Storage Admin = buckets + objects."},
{m:"iam",topic:"Service account VM",d:2,ty:"scenario",hy:true,
 q:"An app on a Compute Engine VM needs to read a Cloud Storage bucket securely, without storing key files. Best approach?",
 opts:["Hardcode a downloaded SA key in the app","Attach a user-managed service account with Storage Object Viewer to the VM","Use the developer's personal credentials","Make the bucket public"],a:1,
 ex:"Attaching a least-privilege service account to the VM uses Google-managed, auto-rotated credentials — no key files to leak, no personal creds.",
 wy:{0:"Downloaded key files can leak and must be rotated manually.",2:"Personal credentials are a security/audit anti-pattern.",3:"Public buckets expose data to everyone."},
 trick:"VM→GCP API: attach a service account; don't ship key files."},
{m:"iam",topic:"Cross-project SA",d:3,ty:"scenario",hy:true,
 q:"A VM's default service account in Project A must read a bucket in Project B. What is the correct setup?",
 opts:["Make the bucket public","In Project B, grant Project A's service account the Storage Object Viewer role on the bucket","Move both projects into one","Share the SA key file"],a:1,
 ex:"Grant the Project-A service account (by its email) the needed role ON the Project-B resource. IAM works across projects by referencing the SA identity.",
 wy:{0:"Public access is insecure and overbroad.",2:"Merging projects is unnecessary and disruptive.",3:"Sharing key files is a security anti-pattern."},
 trick:"Cross-project = grant the other project's SA a role on YOUR resource."},
{m:"iam",topic:"Org policy vs IAM",d:2,ty:"scenario",hy:true,
 q:"You must prevent ALL projects in your organization from creating resources outside europe regions. What do you use?",
 opts:["An IAM deny on each user","An Organization Policy constraint restricting resource locations","A firewall rule","A billing budget"],a:1,
 ex:"Organization Policy Service enforces org-wide constraints on WHAT is allowed — e.g., restricting resource locations — regardless of who acts.",
 wy:{0:"IAM controls WHO, not WHERE resources can live.",2:"Firewalls control network traffic.",3:"Budgets control spend alerts."},
 trick:"IAM = who; Org Policy = what's allowed org-wide."},
{m:"iam",topic:"Hierarchy inheritance",d:2,ty:"trouble",hy:true,
 q:"You granted Viewer at the folder level and tried to REMOVE it for one project inside that folder. It didn't work. Why?",
 opts:["IAM policies are inherited downward and are additive — you can't subtract at a lower level","You need Owner to remove roles","Folders don't support IAM","The project must be deleted"],a:0,
 ex:"IAM inheritance flows Org→Folder→Project→Resource and is additive (union). A grant made at a parent level can't be revoked at a child level.",
 wy:{1:"It's not a permission issue — it's how inheritance works.",2:"Folders do support IAM.",3:"Deletion is not the fix."},
 trick:"Inheritance is additive; you cannot deny lower what a parent grants."},
{m:"iam",topic:"Billing roles",d:2,ty:"scenario",hy:true,
 q:"A user must create a new project AND link it to an existing billing account. Which two roles are needed?",
 opts:["Owner only","Project Creator + Billing Account User","Billing Account Administrator only","Billing Account Creator + Viewer"],a:1,
 ex:"Project Creator lets them create the project; Billing Account User lets them associate the project with the existing billing account.",
 wy:{0:"Owner on what? They need project-create + billing-link specifically.",2:"Admin manages a billing account but doesn't create projects.",3:"Creator makes new billing accounts (not needed) and Viewer can't link."},
 trick:"Create + link project → Project Creator + Billing Account User."},
{m:"iam",topic:"Separation of duties",d:3,ty:"scenario",hy:false,
 q:"On App Engine you want one person to deploy versions and a DIFFERENT person to shift live traffic. Which roles?",
 opts:["Both get Owner","Deployer for one, Service Admin for the other","Both get Editor","Both get Viewer"],a:1,
 ex:"App Engine Deployer can deploy versions but not move traffic; App Engine Service Admin can shift traffic but not deploy — a clean separation of duties.",
 wy:{0:"Owner gives everyone everything.",2:"Editor is too broad and identical for both.",3:"Viewer can't do either action."},
 trick:"Deployer deploys (no traffic); Service Admin shifts traffic (no deploy)."},

{m:"ops",topic:"Monitoring agent",d:2,ty:"trouble",hy:true,
 q:"Your Cloud Monitoring dashboard shows CPU but NOT memory utilization for your VMs. Why?",
 opts:["Memory needs the Cloud Monitoring agent installed on the VM","Memory metrics don't exist","You need Owner role","The VM is too small"],a:0,
 ex:"Default VM metrics include CPU, disk, network, and uptime — but MEMORY and disk-space utilization require the Cloud Monitoring agent to be installed.",
 wy:{1:"Memory metrics exist via the agent.",2:"It's not a permissions issue.",3:"Size is irrelevant."},
 trick:"Memory + disk-space utilization = install the Monitoring agent."},
{m:"ops",topic:"Audit logs",d:2,ty:"scenario",hy:true,
 q:"You must record every read and write on all objects in a bucket for a security audit. What do you enable?",
 opts:["Admin Activity logs (already on)","Data Access audit logging for the bucket","Cloud Trace","VPC Flow Logs"],a:1,
 ex:"Data Access audit logs capture reads and data operations. They are OFF by default and must be explicitly enabled, unlike Admin Activity logs which are always on.",
 wy:{0:"Admin Activity logs config changes, not object reads.",2:"Trace is for latency, not audits.",3:"Flow Logs are network traffic, not object access."},
 trick:"'Who read/wrote data' → Data Access audit logs (must enable). Config changes → Admin Activity (always on)."},
{m:"ops",topic:"Log retention",d:2,ty:"cost",hy:true,
 q:"You must retain audit logs cheaply for years for external auditors, with rare access. Best export target?",
 opts:["Keep them in Cloud Logging default bucket","Export via a sink to Cloud Storage (Archive/Coldline)","Export to Bigtable","Print to a VM disk"],a:1,
 ex:"Route logs through a sink to Cloud Storage for cheap long-term retention; give auditors Storage Object Viewer. Cheapest for rarely-accessed archival logs.",
 wy:{0:"Default log bucket retention is limited and not cheapest for years.",2:"Bigtable is for high-throughput data, not cheap archives.",3:"A VM disk isn't durable/managed."},
 trick:"Cheap long-term log retention → sink to Cloud Storage. SQL analysis → sink to BigQuery."},
{m:"ops",topic:"Trace vs Profiler",d:2,ty:"scenario",hy:false,
 q:"You need to find WHICH microservice adds latency along a request path. Which tool?",
 opts:["Cloud Profiler","Cloud Trace","Error Reporting","Cloud Debugger"],a:1,
 ex:"Cloud Trace does distributed tracing, showing latency contributions of each service along a request — perfect for latency hotspot analysis.",
 wy:{0:"Profiler shows CPU/memory consumption, not request paths.",2:"Error Reporting aggregates exceptions.",3:"Debugger inspects live variable state."},
 trick:"Latency across services → Trace. CPU/mem bottleneck → Profiler."},
{m:"ops",topic:"Debugger",d:2,ty:"scenario",hy:false,
 q:"You must inspect variable state of a production app WITHOUT adding log statements or redeploying. Which tool?",
 opts:["Cloud Debugger","Cloud Logging","Cloud Trace","Error Reporting"],a:0,
 ex:"Cloud Debugger snapshots the live state (variables, call stack) of a running production app with negligible impact and no redeploy.",
 wy:{1:"Logging requires you to add log statements.",2:"Trace measures latency, not variables.",3:"Error Reporting surfaces exceptions, not arbitrary state."},
 trick:"'Inspect prod state without redeploy/logs' → Cloud Debugger."},

{m:"data",topic:"Pub/Sub decoupling",d:2,ty:"scenario",hy:true,
 q:"Web servers must send log events to a processing service that sometimes goes down, without losing events or blocking the web tier. Best service?",
 opts:["Direct HTTP calls","Cloud Pub/Sub topic + subscription","Cloud SQL","Memorystore"],a:1,
 ex:"Pub/Sub decouples publishers from subscribers: the topic durably retains messages until the (possibly-down) subscriber acknowledges them, so nothing is lost and the web tier isn't blocked.",
 wy:{0:"Direct calls fail when the consumer is down and block the caller.",2:"A DB isn't a message broker.",3:"Memorystore is a cache, not durable messaging."},
 trick:"'Decouple / async / don't lose events' → Pub/Sub."},
{m:"data",topic:"Pub/Sub fan-out",d:3,ty:"trouble",hy:true,
 q:"You have ONE subscription with three subscriber instances. Each message is only processed once total, split across them. You actually wanted EVERY service to get EVERY message. What's wrong?",
 opts:["Multiple subscribers on one subscription share (load-balance) messages; create a separate subscription per service","Pub/Sub is broken","You need more topics per subscriber","Enable ordering"],a:0,
 ex:"Subscribers on the SAME subscription split the messages (competing consumers). For fan-out where each service sees all messages, give each service its OWN subscription.",
 wy:{1:"Working as designed.",2:"You need separate subscriptions, not topics.",3:"Ordering doesn't change fan-out behavior."},
 trick:"Same subscription = split; separate subscriptions = each gets a full copy (fan-out)."},
{m:"data",topic:"Dataflow vs Dataproc",d:2,ty:"scenario",hy:true,
 q:"You must build a NEW serverless pipeline streaming from Pub/Sub into BigQuery, with autoscaling and no clusters. Which service?",
 opts:["Cloud Dataproc","Cloud Dataflow","Compute Engine","Cloud Functions"],a:1,
 ex:"Cloud Dataflow (Apache Beam) is serverless and autoscaling, with prebuilt Pub/Sub→BigQuery templates for streaming pipelines — no clusters to manage.",
 wy:{0:"Dataproc requires managing Spark/Hadoop clusters.",2:"GCE is raw VMs.",3:"Functions aren't a streaming pipeline engine."},
 trick:"New serverless stream/batch pipeline → Dataflow. Existing Spark/Hadoop → Dataproc."},
{m:"data",topic:"Dataproc migration",d:2,ty:"scenario",hy:false,
 q:"You must move existing on-prem Spark and Hadoop jobs to GCP with minimal changes and can use preemptible workers to cut cost. Which service?",
 opts:["Cloud Dataflow","Cloud Dataproc","BigQuery","Pub/Sub"],a:1,
 ex:"Cloud Dataproc runs managed Spark/Hadoop, letting you lift-and-shift existing jobs and use preemptible workers for cheaper batch processing.",
 wy:{0:"Dataflow uses Beam, not native Spark/Hadoop.",2:"BigQuery is a warehouse, not a Spark runtime.",3:"Pub/Sub is messaging."},
 trick:"'Existing Spark/Hadoop migration' → Dataproc."},

{m:"tool",topic:"gcloud CLIs",d:2,ty:"mcq",hy:true,
 q:"Which command-line tool is used specifically for BigQuery?",
 opts:["gsutil","bq","cbt","kubectl"],a:1,
 ex:"bq is the BigQuery CLI. gsutil/gcloud storage → Cloud Storage, cbt → Bigtable, kubectl → Kubernetes workloads.",
 wy:{0:"gsutil is for Cloud Storage.",2:"cbt is for Bigtable.",3:"kubectl manages Kubernetes workloads."},
 trick:"gsutil=GCS, bq=BigQuery, cbt=Bigtable, kubectl=K8s workloads."},
{m:"tool",topic:"gcloud config",d:2,ty:"scenario",hy:false,
 q:"You switch between multiple projects all day and want to swap full sets of settings (project, region, account) quickly. What do you use?",
 opts:["Re-run gcloud init each time","gcloud config configurations create/activate","Edit environment variables manually","Use separate machines"],a:1,
 ex:"Named gcloud configurations let you store and activate whole profiles (project, region, zone, account) with a single activate command.",
 wy:{0:"init is heavier and interactive.",2:"Manual env edits are error-prone.",3:"Separate machines is absurd overhead."},
 trick:"Multiple project profiles → gcloud config configurations."},
{m:"tool",topic:"Zone precedence",d:3,ty:"trouble",hy:false,
 q:"You set a default zone with gcloud config, but a create command still used a different zone. Why?",
 opts:["Config always wins","A --zone flag on the command overrides the local config","Project metadata overrides the flag","Zones can't be set on commands"],a:1,
 ex:"Precedence is: command flag (--zone) > local gcloud config > project metadata. A flag on the command always wins over config defaults.",
 wy:{0:"Config is overridden by an explicit flag.",2:"Metadata is the LOWEST precedence.",3:"Zones can be set per command."},
 trick:"Precedence: --flag > gcloud config > project metadata."},
{m:"tool",topic:"IaC",d:2,ty:"scenario",hy:false,
 q:"You must repeatably provision identical VPC + VMs + database across dev, QA, stage, and prod with no config drift. Best approach?",
 opts:["Click through the console each time","Use Deployment Manager (or Terraform) templates","Email a checklist","Snapshot one environment"],a:1,
 ex:"Infrastructure as Code (Deployment Manager or Terraform via Cloud Foundation Toolkit) makes provisioning repeatable, version-controlled, and free of drift across environments.",
 wy:{0:"Manual console work causes drift and errors.",2:"Checklists aren't automated.",3:"Snapshots capture disks, not full environment topology."},
 trick:"'Repeatable / no drift / multiple environments' → IaC (Deployment Manager/Terraform)."},
];

/* build topic->concept lookup and per-module question index */
const QBY={}; MODULES.forEach(m=>QBY[m.id]=[]); Q.forEach((q,i)=>{q._i=i; QBY[q.m].push(i);});
const HYTOPICS=[...new Set(Q.filter(q=>q.hy).map(q=>q.m+"|"+q.topic))];

/* ================= STATE ================= */
const LS="cloudAscent.v1";
const DEF=()=>({
  xp:0, streak:0, best:0,
  answered:0, correct:0, timeSum:0, timeN:0,
  topic:{}, mod:{}, seenConcepts:{}, mistakes:[], ach:{}, srs:{},
  history:[], theme:null, lastExam:null, updatedAt:0,
});
let S;
function load(){ try{S=Object.assign(DEF(),JSON.parse(localStorage.getItem(LS)||"{}"));}catch(e){S=DEF();} }
function save(){ try{ S.updatedAt=Date.now(); localStorage.setItem(LS,JSON.stringify(S)); if(window.__onSave)window.__onSave(); }catch(e){} }
load();

const LEVELS=[
 {min:0,name:"Trainee"},{min:100,name:"Cloud Novice"},{min:280,name:"Apprentice"},
 {min:540,name:"Practitioner"},{min:900,name:"Engineer"},{min:1400,name:"Architect"},
 {min:2100,name:"Cloud Sage"},{min:3200,name:"ACE Master"}];
function levelInfo(){
  let lvl=0; for(let i=0;i<LEVELS.length;i++){ if(S.xp>=LEVELS[i].min) lvl=i; }
  const cur=LEVELS[lvl], next=LEVELS[lvl+1];
  const floor=cur.min, ceil=next?next.min:cur.min+1200;
  return {lvl:lvl+1, name:cur.name, floor, ceil, pct:Math.min(100,Math.round((S.xp-floor)/(ceil-floor)*100))};
}
function addXP(n){ const before=levelInfo().lvl; S.xp+=n; const after=levelInfo(); if(after.lvl>before){ achPop("Level Up!","You reached Level "+after.lvl+" · "+after.name); } save(); renderHUD(); }

const ACH=[
 {id:"first",n:"First Steps",d:"Answer your first question"},
 {id:"streak5",n:"On Fire",d:"5-answer streak"},
 {id:"streak10",n:"Unstoppable",d:"10-answer streak"},
 {id:"hy",n:"High-Yield Hunter",d:"Finish a High-Yield session"},
 {id:"concepts10",n:"Bookworm",d:"Read 10 concept pages"},
 {id:"perfectquiz",n:"Flawless",d:"100% on a 10-question quiz"},
 {id:"exam",n:"Battle-Tested",d:"Complete a Boss Battle exam"},
 {id:"exampass",n:"Exam Ready",d:"Score ≥80% on the simulator"},
 {id:"detective",n:"Cloud Detective",d:"Crack a broken-architecture case"},
 {id:"nomistakes",n:"Clean Slate",d:"Clear a mistake from the notebook"},
 {id:"master",n:"Domain Master",d:"Reach 90% mastery in any module"},
];
function grant(id){ if(S.ach[id])return; S.ach[id]=true; const a=ACH.find(x=>x.id===id); if(a)achPop("🏆 "+a.n,a.d); save(); }

const SRSGAP=[1*60*1000, 30*60*1000, 6*3600*1000, 24*3600*1000, 3*24*3600*1000, 7*24*3600*1000];
function recordAnswer(q,chosen,secs){
  const key=q.m+"|"+q.topic;
  S.topic[key]=S.topic[key]||{seen:0,right:0,wrong:0};
  S.mod[q.m]=S.mod[q.m]||{seen:0,right:0};
  const ok=chosen===q.a;
  S.answered++; S.topic[key].seen++; S.mod[q.m].seen++;
  if(secs){ S.timeSum+=secs; S.timeN++; }
  if(ok){ S.correct++; S.topic[key].right++; S.mod[q.m].right++; S.streak++; S.best=Math.max(S.best,S.streak);
    addXP(q.d*8 + Math.min(12,S.streak*2));
    const b=S.srs[key]||{box:0,due:0}; b.box=Math.min(5,b.box+1); b.due=Date.now()+SRSGAP[b.box]; S.srs[key]=b;
  } else {
    S.topic[key].wrong++; S.streak=0;
    const b=S.srs[key]||{box:0,due:0}; b.box=0; b.due=Date.now()+SRSGAP[0]; S.srs[key]=b;
    logMistake(q,chosen);
  }
  if(!S.ach.first) grant("first");
  if(S.streak>=5) grant("streak5"); if(S.streak>=10) grant("streak10");
  if(modMastery(q.m)>=90) grant("master");
  save(); renderHUD();
  return ok;
}
function logMistake(q,chosen){
  const key=q.m+"|"+q.topic;
  const existing=S.mistakes.find(x=>x.qi===q._i);
  const why=q.wy&&q.wy[chosen]?q.wy[chosen]:"Selected an option that doesn't fit the scenario.";
  if(existing){ existing.count++; existing.ts=Date.now(); existing.chose=chosen; existing.why=why; }
  else S.mistakes.unshift({qi:q._i,m:q.m,topic:q.topic,q:q.q,chose:chosen,correct:q.a,
    chosenTxt:q.opts[chosen],correctTxt:q.opts[q.a],why,trick:q.trick||"",ts:Date.now(),count:1});
  if(S.mistakes.length>200) S.mistakes.pop();
}
function topicLevel(key){
  const t=S.topic[key]; if(!t||t.seen<2) return 2;
  const acc=t.right/t.seen;
  if(acc<0.5) return 1;
  if(acc>0.8 && t.seen>=4) return 3;
  return 2;
}
function modMastery(mid){
  const idxs=QBY[mid]; if(!idxs.length) return 0;
  let seenW=0, rightW=0;
  idxs.forEach(i=>{const q=Q[i];const k=q.m+"|"+q.topic;const t=S.topic[k];
    if(t&&t.seen){ const w=q.d; seenW+=w; rightW+=w*(t.right/t.seen);} });
  const covered=Object.keys(S.topic).filter(k=>k.startsWith(mid+"|")).length;
  const totalTopics=new Set(idxs.map(i=>Q[i].topic)).size;
  if(!seenW) return 0;
  return Math.round((rightW/seenW)*(covered/totalTopics)*100);
}
function overallAcc(){ return S.answered? Math.round(S.correct/S.answered*100):null; }
function readiness(){
  const masteries=MODULES.map(m=>modMastery(m.id));
  const avgMast=masteries.reduce((a,b)=>a+b,0)/masteries.length;
  const acc=overallAcc()||0;
  const exam=S.lastExam?S.lastExam.pct:0;
  const vol=Math.min(1,S.answered/120);
  const r=Math.round((avgMast*0.4 + acc*0.3 + exam*0.2 + vol*100*0.1));
  return Math.max(0,Math.min(100,r));
}

/* ================= HUD + THEME ================= */
function renderHUD(){
  const li=levelInfo();
  document.getElementById("hudStreak").textContent=S.streak;
  document.getElementById("hudAcc").textContent=(overallAcc()==null?"—":overallAcc()+"%");
  document.getElementById("hudLvl").textContent="Level "+li.lvl+" · "+li.name;
  document.getElementById("hudXp").textContent=(S.xp-li.floor)+" / "+(li.ceil-li.floor)+" XP";
  document.getElementById("xpbar").style.width=li.pct+"%";
}
function applyTheme(){ const r=document.documentElement; if(S.theme) r.setAttribute("data-theme",S.theme); else r.removeAttribute("data-theme"); }
document.getElementById("themeBtn").onclick=()=>{
  const cur=S.theme|| (matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light");
  S.theme=cur==="dark"?"light":"dark"; save(); applyTheme();
};
document.getElementById("resetBtn").onclick=()=>{
  if(confirm("Reset ALL progress, XP, mistakes and stats on this device? This cannot be undone.")){ localStorage.removeItem(LS); load(); applyTheme(); renderHUD(); go("dash"); toast("Progress reset."); }
};

/* ================= UI HELPERS ================= */
const $=(s,el=document)=>el.querySelector(s);
const el=(tag,cls,html)=>{const e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e;};
function toast(msg){ const t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("show"),2200); }
function achPop(title,sub){ const w=document.getElementById("ach"); const p=el("div","achpop","<b>"+esc(title)+"</b><small>"+esc(sub)+"</small>"); w.appendChild(p); setTimeout(()=>{p.style.transition="opacity .4s";p.style.opacity="0";setTimeout(()=>p.remove(),400);},3600); }
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function stars(n){return "★".repeat(n)+"☆".repeat(3-n);}
function fmtTime(ts){const d=Math.floor((Date.now()-ts)/60000); if(d<1)return "just now"; if(d<60)return d+"m ago"; const h=Math.floor(d/60); if(h<24)return h+"h ago"; return Math.floor(h/24)+"d ago";}

/* ================= ROUTER + SIDEBAR ================= */
const NAV=[
 {sec:"Learn"},
 {id:"dash",ic:"◆",label:"Dashboard"},
 {id:"modules",ic:"▤",label:"Modules"},
 {id:"compare",ic:"⇄",label:"Comparisons"},
 {id:"highyield",ic:"★",label:"High-Yield"},
 {sec:"Play"},
 {id:"quiz",ic:"⚡",label:"Quiz Arena"},
 {id:"speed",ic:"⏱",label:"Speed Round"},
 {id:"flash",ic:"🂠",label:"Flashcards"},
 {id:"match",ic:"⇌",label:"Match & Drag"},
 {id:"memory",ic:"🧠",label:"Memory Match"},
 {id:"scenario",ic:"🧭",label:"Scenario"},
 {id:"arch",ic:"🏗",label:"Architecture"},
 {id:"detective",ic:"🔎",label:"Cloud Detective"},
 {id:"cost",ic:"💰",label:"Cost Optimizer"},
 {sec:"Exam"},
 {id:"boss",ic:"👑",label:"Boss Battle"},
 {id:"sim",ic:"📝",label:"Exam Simulator"},
 {sec:"Track"},
 {id:"insights",ic:"📈",label:"Insights"},
 {id:"mistakes",ic:"📓",label:"Mistake Notebook"},
];
function renderSide(active){
  const s=document.getElementById("side"); s.innerHTML="";
  NAV.forEach(n=>{
    if(n.sec){ s.appendChild(el("div","navsec",n.sec)); return; }
    const b=el("button","navitem"+(n.id===active?" on":""));
    let badge="";
    if(n.id==="mistakes"&&S.mistakes.length) badge='<span class="badge">'+S.mistakes.length+'</span>';
    if(n.id==="highyield") badge='<span class="badge">'+HYTOPICS.length+'</span>';
    b.innerHTML='<span class="ni">'+n.ic+'</span>'+n.label+badge;
    b.onclick=()=>go(n.id); s.appendChild(b);
  });
}
let CUR="dash";
function go(id,arg){ CUR=id; renderSide(id); const m=document.getElementById("main"); m.innerHTML=""; window.scrollTo(0,0); (VIEWS[id]||VIEWS.dash)(m,arg); }

/* ================= VIEWS ================= */
const VIEWS={};

VIEWS.dash=(m)=>{
  const li=levelInfo(), r=readiness();
  const head=el("div","view");
  head.innerHTML='<div class="eyebrow">Google Associate Cloud Engineer</div>'
    +'<h1 class="h-title">Your ascent to ACE certified</h1>'
    +'<p class="sub">Learn every exam domain from first principles, then drill it through nine game modes and a realistic exam simulator. Progress, mistakes, and mastery are saved on this device — and to your account if you sign in.</p>';
  m.appendChild(head);

  const ready=el("div","card","");
  ready.style.cssText="margin:22px 0;padding:22px;display:flex;gap:26px;align-items:center;flex-wrap:wrap";
  ready.innerHTML=
   '<div style="position:relative;width:132px;height:132px;flex-shrink:0">'
    +ring(r,132,"var(--green)")+
    '<div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center">'
    +'<div><div style="font-size:30px;font-weight:800" class="tnum">'+r+'%</div><div style="font-size:10px;letter-spacing:.6px;color:var(--ink3);text-transform:uppercase">ACE Ready</div></div></div>'
   +'</div>'
   +'<div style="flex:1;min-width:220px">'
    +'<h3 style="font-size:19px;margin-bottom:6px">'+readinessMsg(r)+'</h3>'
    +'<p class="sub" style="font-size:13.5px;margin-bottom:12px">'+readinessTip(r)+'</p>'
    +'<div class="row"><button class="btn" id="d_continue">Continue learning →</button>'
    +'<button class="btn ghost" id="d_sim">Try exam simulator</button></div>'
   +'</div>';
  m.appendChild(ready);
  $("#d_continue",ready).onclick=()=>go("modules");
  $("#d_sim",ready).onclick=()=>go("sim");

  const kpis=el("div","grid g4"); kpis.style.margin="4px 0 22px";
  const avgT=S.timeN?Math.round(S.timeSum/S.timeN):0;
  [["Questions",S.answered],["Accuracy",overallAcc()==null?"—":overallAcc()+"%"],
   ["Best streak",S.best],["Avg time",avgT?avgT+"s":"—"]].forEach(([l,n])=>{
    const c=el("div","card kpi"); c.innerHTML='<div class="n tnum">'+n+'</div><div class="l">'+l+'</div>'; kpis.appendChild(c);
  });
  m.appendChild(kpis);

  const two=el("div","grid g2");
  const mast=el("div","card"); mast.style.padding="18px";
  mast.innerHTML='<h3 style="font-size:15px;margin-bottom:12px">Mastery by module</h3>';
  MODULES.forEach(md=>{ const p=modMastery(md.id);
    const row=el("div","barrow");
    row.innerHTML='<span class="nm">'+md.icon+' '+md.name+'</span><div class="track"><i style="width:'+p+'%;background:'+(p>=70?"var(--green)":p>=40?"var(--yellow)":"var(--red)")+'"></i></div><span class="pct tnum">'+p+'%</span>';
    row.style.cursor="pointer"; row.onclick=()=>go("modview",md.id); mast.appendChild(row);
  });
  two.appendChild(mast);

  const side=el("div","card"); side.style.padding="18px";
  const weak=weakestTopics(4);
  side.innerHTML='<h3 style="font-size:15px;margin-bottom:6px">Focus next</h3><p class="sub" style="font-size:12.5px;margin-bottom:12px">Recommended by your accuracy & spaced-repetition schedule.</p>';
  if(!weak.length) side.innerHTML+='<p class="empty">Answer a few questions to get personalized recommendations.</p>';
  weak.forEach(w=>{
    const b=el("button","opt"); b.style.marginBottom="8px";
    b.innerHTML='<b>'+esc(w.topic)+'</b><br><span style="font-size:11.5px;color:var(--ink3)">'+MODNAME[w.m]+' · '+(w.acc==null?'not yet practiced':w.acc+'% accuracy')+'</span>';
    b.onclick=()=>startQuiz({topics:[w.m+"|"+w.topic],title:w.topic,n:6}); side.appendChild(b);
  });
  two.appendChild(side); m.appendChild(two);

  const ac=el("div","card"); ac.style.cssText="margin-top:22px;padding:18px";
  ac.innerHTML='<h3 style="font-size:15px;margin-bottom:12px">Achievements ('+Object.keys(S.ach).length+'/'+ACH.length+')</h3>';
  const wrap=el("div","row"); ACH.forEach(a=>{ const got=S.ach[a.id];
    const ch=el("span","chip"); ch.style.cssText=got?"background:var(--yellowbg);color:var(--yellow)":"opacity:.5";
    ch.title=a.d; ch.textContent=(got?"🏆 ":"🔒 ")+a.n; wrap.appendChild(ch); });
  ac.appendChild(wrap); m.appendChild(ac);
  renderHUD();
};
function ring(pct,size,col){
  const r=(size-14)/2, c=2*Math.PI*r, off=c*(1-pct/100);
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'" style="transform:rotate(-90deg)">'
   +'<circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" fill="none" stroke="var(--surface2)" stroke-width="10"/>'
   +'<circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="10" stroke-linecap="round" stroke-dasharray="'+c+'" stroke-dashoffset="'+off+'" style="transition:stroke-dashoffset .8s"/></svg>';
}
function readinessMsg(r){ if(r>=80)return "You're exam-ready. 🎯"; if(r>=60)return "Getting close — tighten the weak spots."; if(r>=35)return "Solid foundation forming."; return "Let's build your foundation."; }
function readinessTip(r){ if(r>=80)return "Run full 50-question simulator rounds and review any misses in the Mistake Notebook."; if(r>=60)return "Focus your weakest modules and drill High-Yield topics to cross 80%."; if(r>=35)return "Read concept pages, then hit Quiz Arena per module to raise mastery."; return "Start with Modules → read a concept → unlock its quiz. High-Yield topics matter most."; }
function weakestTopics(n){
  const all=[...new Set(Q.map(q=>q.m+"|"+q.topic))];
  const scored=all.map(k=>{const[m,topic]=k.split("|");const t=S.topic[k];
    const acc=t&&t.seen?Math.round(t.right/t.seen*100):null;
    const hy=Q.find(q=>q.m===m&&q.topic===topic).hy;
    let score= acc==null? (hy?55:45) : acc - (hy?10:0);
    return {m,topic,acc,hy,score};});
  return scored.sort((a,b)=>a.score-b.score).slice(0,n);
}

/* ---------- MODULES LIST ---------- */
VIEWS.modules=(m)=>{
  m.appendChild(head("Learning path","10 exam modules","Read a concept from first principles, then its quiz unlocks. Rings show your live mastery."));
  const g=el("div","grid g3");
  MODULES.forEach(md=>{
    const p=modMastery(md.id);
    const seen=Object.keys(S.seenConcepts[md.id]||{}).length, tot=CONCEPTS[md.id].length;
    const c=el("div","card modcard");
    c.innerHTML='<div style="display:flex;justify-content:space-between;align-items:flex-start">'
      +'<div style="font-size:30px">'+md.icon+'</div>'
      +'<div class="ring" style="--p:'+p+'"><i>'+p+'%</i></div></div>'
      +'<h4 style="margin:12px 0 4px;font-size:16px">'+md.name+'</h4>'
      +'<p style="font-size:12.5px;color:var(--ink2);margin:0 0 10px">'+md.desc+'</p>'
      +'<div class="row" style="font-size:11px;color:var(--ink3)"><span>📖 '+seen+'/'+tot+' concepts</span>'
      +'<span>· '+QBY[md.id].length+' questions</span></div>';
    c.onclick=()=>go("modview",md.id); g.appendChild(c);
  });
  m.appendChild(g);
};
function head(eyebrow,title,sub){ const h=el("div","view"); h.innerHTML='<div class="eyebrow">'+esc(eyebrow)+'</div><h1 class="h-title">'+esc(title)+'</h1>'+(sub?'<p class="sub">'+esc(sub)+'</p>':''); return h; }

/* ---------- MODULE DETAIL ---------- */
VIEWS.modview=(m,mid)=>{
  mid=mid||"fund"; const md=MODULES.find(x=>x.id===mid);
  const h=head(md.name,md.icon+" "+md.name,md.desc); m.appendChild(h);
  const bar=el("div","row"); bar.style.margin="4px 0 18px";
  bar.innerHTML='<button class="btn sm" id="mv_quiz">⚡ Quiz this module</button>'
    +'<button class="btn ghost sm" id="mv_flash">🂠 Flashcards</button>'
    +'<button class="btn ghost sm" id="mv_back">← All modules</button>';
  m.appendChild(bar);
  $("#mv_quiz",bar).onclick=()=>startQuiz({module:mid,title:md.name,n:8});
  $("#mv_flash",bar).onclick=()=>go("flash",mid);
  $("#mv_back",bar).onclick=()=>go("modules");

  CONCEPTS[mid].forEach((c,i)=>{
    const read=(S.seenConcepts[mid]||{})[i];
    const d=el("details","accordion"); if(i===0&&!read)d.open=true;
    const hy=c.hy?'<span class="pill hy">★ HIGH-YIELD</span> ':'';
    d.innerHTML='<summary><span>'+hy+esc(c.t)+' <span class="stars">'+stars(c.stars)+'</span></span>'
      +'<span style="font-size:11px;color:'+(read?'var(--green)':'var(--ink3)')+'">'+(read?'✓ read':'read →')+'</span></summary>';
    const body=el("div","body");
    body.innerHTML=conceptHTML(c);
    d.appendChild(body);
    d.addEventListener("toggle",()=>{ if(d.open){ S.seenConcepts[mid]=S.seenConcepts[mid]||{}; if(!S.seenConcepts[mid][i]){ S.seenConcepts[mid][i]=true; addXP(6); const total=Object.values(S.seenConcepts).reduce((a,o)=>a+Object.keys(o).length,0); if(total>=10)grant("concepts10"); save(); } } });
    const qbtn=el("button","btn ghost sm","Practice “"+esc(c.t)+"” →"); qbtn.style.marginTop="10px";
    qbtn.onclick=()=>startQuiz({topics:[mid+"|"+c.t],title:c.t,n:5,fallbackModule:mid});
    body.appendChild(qbtn);
    m.appendChild(d);
  });
};
function conceptHTML(c){
  let h='<p style="margin:0 0 10px"><b>Purpose.</b> '+esc(c.purpose)+'</p>';
  if(c.why)h+='<p style="margin:0 0 10px;color:var(--ink2)"><b>Why it exists.</b> '+esc(c.why)+'</p>';
  if(c.how){h+='<div style="margin:0 0 10px"><b>How it works</b><ul style="margin:6px 0 0;padding-left:18px">'+c.how.map(x=>'<li style="margin:3px 0">'+esc(x)+'</li>').join("")+'</ul></div>';}
  if(c.example)h+='<div style="background:var(--accentbg);border-radius:10px;padding:10px 12px;margin:0 0 10px;font-size:12.5px"><b>Real-world example.</b> '+esc(c.example)+'</div>';
  if(c.tips){h+='<div style="margin:0 0 8px"><b style="color:var(--green)">⭐ Exam tips</b><ul style="margin:6px 0 0;padding-left:18px">'+c.tips.map(x=>'<li style="margin:3px 0">'+esc(x)+'</li>').join("")+'</ul></div>';}
  if(c.traps){h+='<div style="background:var(--redbg);border-radius:10px;padding:10px 12px;margin:0 0 10px;font-size:12.5px"><b style="color:var(--red)">⚠ Common traps</b><ul style="margin:6px 0 0;padding-left:18px">'+c.traps.map(x=>'<li style="margin:3px 0">'+esc(x)+'</li>').join("")+'</ul></div>';}
  if(c.notuse)h+='<p style="margin:0;color:var(--ink3);font-size:12.5px"><b>When NOT to use it.</b> '+esc(c.notuse)+'</p>';
  return h;
}

/* ---------- COMPARISONS ---------- */
VIEWS.compare=(m)=>{
  m.appendChild(head("Decision engine","Service comparisons","The pairs and tables the ACE loves to test. Read the note under each — that's where the exam trick lives."));
  COMPARISONS.forEach(cp=>{
    const card=el("div","card"); card.style.cssText="padding:18px;margin-bottom:18px";
    card.innerHTML=(cp.hy?'<span class="pill hy" style="margin-bottom:8px">★ HIGH-YIELD</span>':'')
      +'<h3 style="font-size:16px;margin:6px 0 12px">'+esc(cp.title)+'</h3>';
    let t='<div class="tblwrap"><table><thead><tr>'+cp.cols.map(c=>'<th>'+esc(c)+'</th>').join("")+'</tr></thead><tbody>';
    cp.rows.forEach(r=>{ t+='<tr>'+r.map((cell,ci)=>ci===0?'<th style="position:static">'+esc(cell)+'</th>':'<td>'+esc(cell)+'</td>').join("")+'</tr>'; });
    t+='</tbody></table></div>';
    card.innerHTML+=t+'<div class="trickbox" style="margin-top:12px"><b>🎯 Exam trick:</b> '+esc(cp.note)+'</div>';
    m.appendChild(card);
  });
};

/* ---------- HIGH-YIELD ---------- */
VIEWS.highyield=(m)=>{
  m.appendChild(head("Maximize your odds","High-Yield concepts","The topics that appear most often on the ACE, drawn from exam-pattern analysis. Master these first — they carry the most weight."));
  const bar=el("div","row"); bar.style.margin="4px 0 18px";
  bar.innerHTML='<button class="btn" id="hy_drill">★ Drill all High-Yield ('+HYTOPICS.length+')</button>'
    +'<button class="btn ghost" id="hy_flash">🂠 High-Yield flashcards</button>';
  m.appendChild(bar);
  $("#hy_drill",bar).onclick=()=>startQuiz({topics:HYTOPICS,title:"High-Yield drill",n:12,onEnd:()=>grant("hy")});
  $("#hy_flash",bar).onclick=()=>go("flash","__hy");

  const g=el("div","grid g2");
  HYTOPICS.forEach(k=>{
    const[mid,topic]=k.split("|");
    const t=S.topic[k]; const acc=t&&t.seen?Math.round(t.right/t.seen*100):null;
    const qc=Q.filter(q=>q.m===mid&&q.topic===topic).length;
    const c=el("div","card"); c.style.cssText="padding:16px;cursor:pointer";
    c.innerHTML='<div class="row" style="justify-content:space-between"><span class="pill p-blue">'+MODNAME[mid]+'</span>'
      +(acc==null?'<span class="chip">new</span>':'<span class="chip" style="background:'+(acc>=70?'var(--greenbg);color:var(--green)':acc>=40?'var(--yellowbg);color:var(--yellow)':'var(--redbg);color:var(--red)')+'">'+acc+'%</span>')+'</div>'
      +'<h4 style="margin:10px 0 4px;font-size:15px">'+esc(topic)+'</h4>'
      +'<p style="font-size:12px;color:var(--ink3);margin:0">'+qc+' practice questions</p>';
    c.onclick=()=>startQuiz({topics:[k],title:topic,n:Math.min(6,qc)}); g.appendChild(c);
  });
  m.appendChild(g);
};

/* ================= QUESTION SELECTION (adaptive) ================= */
function pickQuestions(opts){
  let pool=Q.map((q,i)=>i);
  if(opts.module) pool=QBY[opts.module].slice();
  if(opts.topics){ const set=new Set(opts.topics); pool=Q.map((q,i)=>i).filter(i=>set.has(Q[i].m+"|"+Q[i].topic)); }
  if(opts.types){ const ts=new Set(opts.types); pool=pool.filter(i=>ts.has(Q[i].ty)); }
  if(opts.hy) pool=pool.filter(i=>Q[i].hy);
  if(!pool.length && opts.fallbackModule) pool=QBY[opts.fallbackModule].slice();
  if(!pool.length) pool=Q.map((q,i)=>i);
  const now=Date.now();
  const weighted=pool.map(i=>{ const q=Q[i]; const key=q.m+"|"+q.topic;
    const t=S.topic[key]; const seen=t?t.seen:0;
    const srs=S.srs[key]; const due= srs? Math.max(0,1-(srs.due-now)/(7*24*3600*1000)) : .5;
    const want=topicLevel(key); const diffMatch= (q.d===want)?1.4 : (Math.abs(q.d-want)===1?1:.6);
    const wrongBias= t&&t.wrong? 1+Math.min(1,t.wrong*0.3):1;
    const freshness= 1/(1+seen*0.4);
    return {i, w: (0.6+due)*diffMatch*wrongBias*freshness*(0.7+Math.random()*0.6)};
  });
  weighted.sort((a,b)=>b.w-a.w);
  let chosen=weighted.map(x=>x.i);
  const n=Math.min(opts.n||8, chosen.length);
  return chosen.slice(0,Math.max(n, Math.min(chosen.length,n)));
}

/* ================= SHARED QUIZ ENGINE ================= */
function startQuiz(opts){
  const list=pickQuestions(opts);
  const st={list, idx:0, right:0, timed:!!opts.timed, opts, answers:[]};
  go("__quiz"); renderQuiz(document.getElementById("main"), st);
}
VIEWS.__quiz=(m)=>{ m.innerHTML='<div class="empty">Loading…</div>'; };

function renderQuiz(m,st){
  m.innerHTML="";
  const {list,idx}=st;
  if(idx>=list.length){ return quizSummary(m,st); }
  const q=Q[list[idx]];
  const wrap=el("div","view qwrap");
  const meta=el("div","qmeta");
  meta.innerHTML='<span>'+esc(st.opts.title||MODNAME[q.m])+' · Q'+(idx+1)+'/'+list.length+'</span>'
    +'<span>'+(q.hy?'<span class="pill hy">★HY</span> ':'')+'<span class="pill p-blue">'+esc(q.topic)+'</span> '
    +'<span class="stars">'+stars(q.d)+'</span></span>';
  wrap.appendChild(meta);
  const pb=el("div","bar"); pb.style.marginBottom="16px"; pb.innerHTML='<i style="width:'+(idx/list.length*100)+'%"></i>'; wrap.appendChild(pb);

  let timerBar,timer,tLeft, startTs=Date.now();
  if(st.timed){ timerBar=el("div","timerbar"); timerBar.innerHTML='<i></i>'; wrap.appendChild(timerBar); }

  wrap.appendChild(el("h3",null,esc(q.q)));
  const optbox=el("div"); optbox.style.marginTop="16px";
  const order=q._order||(q._order=q.opts.map((_,i)=>i));
  const btns=[];
  order.forEach((oi,pos)=>{
    const b=el("button","opt"); b.innerHTML='<span class="k">'+"ABCD"[pos]+'</span>'+esc(q.opts[oi]);
    b.onclick=()=>answer(oi); optbox.appendChild(b); btns[oi]=b;
  });
  wrap.appendChild(optbox);
  const foot=el("div"); foot.style.marginTop="8px"; wrap.appendChild(foot);
  m.appendChild(wrap);

  let answered=false;
  if(st.timed){ const dur=q.ty==="mcq"?18:22; tLeft=dur; const bar=timerBar.firstChild;
    timer=setInterval(()=>{ tLeft--; bar.style.width=(tLeft/dur*100)+"%"; if(tLeft<=0){ clearInterval(timer); if(!answered) answer(-1); } },1000);
  }
  function answer(chosen){
    if(answered)return; answered=true; if(timer)clearInterval(timer);
    const secs=Math.round((Date.now()-startTs)/1000);
    const ok=chosen===q.a;
    btns.forEach((b,i)=>{ b.disabled=true; if(i===q.a)b.classList.add("correct"); if(i===chosen&&!ok)b.classList.add("wrong"); });
    recordAnswer(q, chosen===-1?(q.a===0?1:0):chosen, secs);
    st.answers.push({qi:q._i, chosen, ok});
    if(ok){ st.right++; }
    foot.appendChild(buildExplain(q,chosen));
    const nav=el("div","row"); nav.style.marginTop="14px";
    const nb=el("button","btn", idx+1<list.length?"Next question →":"See results →");
    nb.onclick=()=>{ st.idx++; renderQuiz(m,st); };
    nav.appendChild(nb);
    if(chosen!==q.a){ const rb=el("button","btn ghost","✓ Saved to Notebook"); rb.disabled=true; nav.appendChild(rb); }
    foot.appendChild(nav);
    if(ok){ toast("Correct! 🔥"+S.streak); }
    wrap.querySelector(".bar>i").style.width=((idx+1)/list.length*100)+"%";
  }
}
function buildExplain(q,chosen){
  const box=el("div","explain");
  const ok=chosen===q.a;
  let h='<h5 style="color:'+(ok?'var(--green)':'var(--red)')+'">'+(ok?'✓ Correct':(chosen===-1?'⏱ Time up':'✗ Not quite'))+' — '+esc(q.opts[q.a])+'</h5>';
  h+='<div>'+esc(q.ex)+'</div>';
  const wrongs=Object.keys(q.wy||{}).filter(k=>q.wy[k]&&+k!==q.a);
  if(wrongs.length){ h+='<div class="whywrong"><b style="color:var(--red)">Why the others are wrong</b>';
    wrongs.forEach(k=>{ h+='<div><b>'+esc(q.opts[k])+':</b> '+esc(q.wy[k])+'</div>'; }); h+='</div>'; }
  if(q.trick) h+='<div class="trickbox"><b>🎯 Exam trick tested:</b> '+esc(q.trick)+'</div>';
  box.innerHTML=h; return box;
}
function quizSummary(m,st){
  const total=st.list.length, pct=total?Math.round(st.right/total*100):0;
  if(total>=10 && st.right===total) grant("perfectquiz");
  if(st.opts.onEnd) try{st.opts.onEnd(st);}catch(e){}
  const v=el("div","view qwrap");
  v.innerHTML='<div style="text-align:center">'
    +'<div style="position:relative;width:150px;height:150px;margin:0 auto">'+ring(pct,150,pct>=70?"var(--green)":pct>=40?"var(--yellow)":"var(--red)")
    +'<div style="position:absolute;inset:0;display:grid;place-items:center"><div><div style="font-size:34px;font-weight:800" class="tnum">'+pct+'%</div><div style="font-size:11px;color:var(--ink3)">'+st.right+'/'+total+'</div></div></div></div>'
    +'<h2 style="margin:16px 0 4px">'+(pct>=80?"Excellent! 🎯":pct>=60?"Good progress 👍":"Keep drilling 💪")+'</h2>'
    +'<p class="sub" style="margin:0 auto 18px">'+esc(st.opts.title||"Session")+' complete. '+(pct>=80?"This topic is nearly mastered.":"Review the misses below to lock it in.")+'</p></div>';
  const row=el("div","row"); row.style.justifyContent="center";
  const again=el("button","btn","Play again"); again.onclick=()=>startQuiz(st.opts);
  const rev=el("button","btn ghost","Review mistakes 📓"); rev.onclick=()=>go("mistakes");
  const home=el("button","btn ghost","Dashboard"); home.onclick=()=>go("dash");
  row.appendChild(again); if(st.answers.some(a=>!a.ok))row.appendChild(rev); row.appendChild(home);
  v.appendChild(row);
  const recap=el("div","card"); recap.style.cssText="margin-top:22px;padding:16px";
  recap.innerHTML='<h3 style="font-size:14px;margin-bottom:10px">Question recap</h3>';
  st.answers.forEach((a)=>{ const q=Q[a.qi];
    const r=el("div"); r.style.cssText="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);font-size:13px";
    r.innerHTML='<span style="color:'+(a.ok?'var(--green)':'var(--red)')+';font-weight:800">'+(a.ok?'✓':'✗')+'</span><span>'+esc(q.topic)+' — <span style="color:var(--ink3)">'+esc(q.opts[q.a])+'</span></span>';
    recap.appendChild(r); });
  v.appendChild(recap);
  m.innerHTML=""; m.appendChild(v);
}

/* ---------- QUIZ ARENA ---------- */
VIEWS.quiz=(m)=>{
  m.appendChild(head("Quiz Arena","Adaptive multiple choice","Instant feedback, full explanations, streak bonuses. Difficulty adapts to your accuracy per topic. Pick a scope."));
  const opts=el("div","row"); opts.style.margin="4px 0 18px";
  opts.innerHTML='<label class="row" style="gap:6px;font-size:13px;font-weight:600"><input type="checkbox" id="q_timed"> Timed mode ⏱</label>';
  m.appendChild(opts);
  const timed=()=>document.getElementById("q_timed").checked;
  const g=el("div","grid g3");
  const mk=(icon,title,sub,fn)=>{ const c=el("div","mode"); c.style.setProperty("--accent","var(--blue)");
    c.innerHTML='<div class="mi">'+icon+'</div><h4>'+title+'</h4><p>'+sub+'</p>'; c.onclick=fn; return c; };
  g.appendChild(mk("🎲","Mixed drill","Adaptive across all 10 modules",()=>startQuiz({title:"Mixed drill",n:12,timed:timed()})));
  g.appendChild(mk("★","High-Yield","Only the most-tested topics",()=>startQuiz({topics:HYTOPICS,title:"High-Yield",n:12,timed:timed()})));
  g.appendChild(mk("🎯","Weak spots","Target your lowest-accuracy topics",()=>{const w=weakestTopics(6).map(x=>x.m+"|"+x.topic);startQuiz({topics:w,title:"Weak spots",n:10,timed:timed()});}));
  m.appendChild(g);
  const g2=el("div","grid g3"); g2.style.marginTop="16px";
  MODULES.forEach(md=>{ const c=el("div","mode"); c.style.setProperty("--accent",md.color);
    c.innerHTML='<div class="mi">'+md.icon+'</div><h4>'+md.name+'</h4><p>'+QBY[md.id].length+' questions</p>';
    c.onclick=()=>startQuiz({module:md.id,title:md.name,n:Math.min(10,QBY[md.id].length),timed:timed()}); g2.appendChild(c); });
  m.appendChild(g2);
};

/* ---------- SPEED ROUND ---------- */
VIEWS.speed=(m)=>{
  m.appendChild(head("Speed Round","Beat the clock","Rapid-fire questions with a shrinking timer. Correct answers earn bonus XP; hesitation costs you."));
  const c=el("div","card"); c.style.cssText="padding:22px;text-align:center;max-width:520px;margin:10px auto";
  c.innerHTML='<div style="font-size:44px">⏱</div><h3 style="margin:8px 0 4px">15 questions · timed</h3>'
    +'<p class="sub" style="margin:0 auto 16px">Answer before the bar empties. Missed or timed-out questions go straight to your notebook.</p>';
  const b=el("button","btn","Start Speed Round"); b.onclick=()=>startQuiz({title:"Speed Round",n:15,timed:true,types:["mcq","scenario","trouble","cost"]}); c.appendChild(b);
  m.appendChild(c);
};

/* ---------- FLASHCARDS ---------- */
VIEWS.flash=(m,scope)=>{
  m.appendChild(head("Flashcards","Recall & spaced repetition","Front = a prompt. Flip for the answer, then rate your recall — cards you find hard resurface sooner (Leitner boxes)."));
  function concCard(mid,c){ return {m:mid,key:mid+"|"+c.t,hy:!!c.hy,front:c.t,
    back:'<div class="pill p-blue" style="align-self:flex-start;margin-bottom:8px">'+MODNAME[mid]+'</div>'
      +'<p style="margin:0 0 8px"><b>'+esc(c.t)+'</b></p><p style="margin:0 0 8px;font-size:13px">'+esc(c.purpose)+'</p>'
      +(c.tips?'<div style="font-size:12px"><b style="color:var(--green)">Exam tip:</b> '+esc(c.tips[0])+'</div>':'')
      +(c.traps?'<div style="font-size:12px;margin-top:6px"><b style="color:var(--red)">Trap:</b> '+esc(c.traps[0])+'</div>':'')}; }
  let cards=[];
  if(scope==="__hy"){ HYTOPICS.forEach(k=>{const[mid,tp]=k.split("|"); const c=(CONCEPTS[mid]||[]).find(x=>x.t===tp); if(c)cards.push(concCard(mid,c)); }); }
  else if(scope&&CONCEPTS[scope]){ cards=CONCEPTS[scope].map(c=>concCard(scope,c)); }
  else { MODULES.forEach(md=>CONCEPTS[md.id].forEach(c=>cards.push(concCard(md.id,c)))); }
  cards.sort((a,b)=>{const da=(S.srs[a.key]||{due:0}).due, db=(S.srs[b.key]||{due:0}).due; return da-db;});
  const bar=el("div","seg"); ["All","High-Yield","Due now"].forEach((lbl,i)=>{const b=el("button",i===0?"on":"",lbl);b.onclick=()=>seg(i);bar.appendChild(b);}); m.appendChild(bar);
  const stage=el("div"); m.appendChild(stage);
  let filtered=cards, ci=0;
  function seg(i){ [...bar.children].forEach((b,j)=>b.classList.toggle("on",i===j));
    filtered=i===1?cards.filter(c=>c.hy): i===2?cards.filter(c=>(S.srs[c.key]||{due:0}).due<=Date.now()):cards; ci=0; draw(); }
  function draw(){
    stage.innerHTML="";
    if(!filtered.length){ stage.appendChild(el("div","empty","No cards in this filter right now — great job staying on schedule!")); return; }
    const c=filtered[ci%filtered.length];
    const flip=el("div","flip");
    flip.innerHTML='<div class="inner">'
      +'<div class="face front"><div class="pill p-blue" style="align-self:flex-start;margin-bottom:10px">'+MODNAME[c.m]+(c.hy?' · ★HY':'')+'</div><h3 style="font-size:20px">'+esc(c.front)+'</h3><p class="sub" style="font-size:12.5px;margin-top:auto">Tap to flip ↻</p></div>'
      +'<div class="face back">'+c.back+'</div></div>';
    flip.onclick=()=>flip.classList.toggle("flipped");
    stage.appendChild(flip);
    const rate=el("div","row"); rate.style.cssText="justify-content:center;margin-top:16px";
    rate.innerHTML='<span style="font-size:12px;color:var(--ink3);align-self:center">How well did you recall?</span>';
    [["Again","var(--red)",0],["Hard","var(--yellow)",1],["Good","var(--blue)",3],["Easy","var(--green)",5]].forEach(([lbl,col,box])=>{
      const b=el("button","btn ghost sm",lbl); b.style.borderColor=col; b.style.color=col;
      b.onclick=()=>{ const s=S.srs[c.key]||{box:0}; s.box=box; s.due=Date.now()+SRSGAP[box]; S.srs[c.key]=s; if(box>=3)addXP(3); save(); ci++; draw(); };
      rate.appendChild(b);
    });
    stage.appendChild(rate);
    const nav=el("div","row"); nav.style.cssText="justify-content:center;margin-top:8px;font-size:12px;color:var(--ink3)";
    nav.textContent="Card "+((ci%filtered.length)+1)+" / "+filtered.length; stage.appendChild(nav);
  }
  draw();
};

/* ---------- SCENARIO ---------- */
VIEWS.scenario=(m)=>{
  m.appendChild(head("Scenario Challenge","Multi-service decision-making","Real ACE-style situations. Choose the right service or design and see why every option is right or wrong."));
  const c=el("div","card"); c.style.cssText="padding:20px;text-align:center;max-width:520px;margin:10px auto";
  c.innerHTML='<div style="font-size:44px">🧭</div><h3 style="margin:8px 0 4px">Scenario & troubleshooting set</h3>'
    +'<p class="sub" style="margin:0 auto 16px">10 situational questions drawn from every domain, weighted toward the topics you find hardest.</p>';
  const b=el("button","btn","Start scenarios"); b.onclick=()=>startQuiz({title:"Scenario Challenge",n:10,types:["scenario","trouble","arch"]}); c.appendChild(b);
  m.appendChild(c);
};

/* ---------- COST OPTIMIZER ---------- */
VIEWS.cost=(m)=>{
  m.appendChild(head("Cost Optimizer","Pick the cheapest correct design","Every question here is about spending less without breaking the requirement — discounts, storage classes, right-sizing."));
  const c=el("div","card"); c.style.cssText="padding:20px;text-align:center;max-width:520px;margin:10px auto";
  c.innerHTML='<div style="font-size:44px">💰</div><h3 style="margin:8px 0 4px">Cost scenarios</h3>'
    +'<p class="sub" style="margin:0 auto 16px">Spot vs committed, storage-class selection, read replicas vs vertical scaling, and more.</p>';
  const b=el("button","btn","Start cost round"); b.onclick=()=>startQuiz({title:"Cost Optimizer",n:8,types:["cost"]}); c.appendChild(b);
  m.appendChild(c);
};

/* ---------- CLOUD DETECTIVE ---------- */
const CASES=[
 {title:"The exposed database",icon:"🕵️",clue:"A production Cloud SQL instance is reachable and someone is hitting it from the internet. Firewall rules allow ingress tcp:3306 from 0.0.0.0/0. App VMs connect from subnet 10.0.1.0/24.",
  issue:"Security / Networking",q:"What is the primary flaw and fix?",
  opts:["Nothing wrong — databases need public access","Ingress allows the whole internet (0.0.0.0/0) to the DB port; restrict the source to the app subnet/VPC and use private IP","The machine type is too small","Enable a static IP on the DB"],a:1,
  ex:"Allowing 0.0.0.0/0 to port 3306 exposes the database to the entire internet. The fix is to scope the firewall source to the app subnet (or use private IP + authorized networks) — least privilege on the network.",
  wy:{0:"Databases should never be openly internet-exposed.",2:"Size is irrelevant to the exposure.",3:"A static IP doesn't reduce exposure."},
  trick:"0.0.0.0/0 on a data port is the classic 'find the security hole' answer."},
 {title:"The over-privileged app",icon:"🔓",clue:"A web app on a VM uses the DEFAULT service account (Editor role) just to read one Cloud Storage bucket. Security review flags it.",
  issue:"IAM / Least privilege",q:"What should you change?",
  opts:["Leave it — Editor is convenient","Attach a user-managed service account with only Storage Object Viewer on that bucket","Give it Owner instead","Store an SA key in the code"],a:1,
  ex:"The default SA's Editor role is far more access than reading one bucket needs. Least privilege = a user-managed SA granted only roles/storage.objectViewer on that bucket.",
  wy:{0:"Editor is dangerously broad.",2:"Owner is even worse.",3:"Embedding key files is a leak risk; attach the SA instead."},
  trick:"Default SA (Editor) over-privilege is a recurring IAM finding."},
 {title:"The disappearing data",icon:"💽",clue:"A team stored critical processing output on a Local SSD to get max IOPS. After a maintenance event the VM restarted and the data was gone.",
  issue:"Storage durability",q:"What went wrong and what's the fix?",
  opts:["Local SSD is ephemeral — move durable data to a Persistent Disk (pd-ssd for IOPS)","The disk was too small","They needed a bigger VM","Snapshots deleted the data"],a:0,
  ex:"Local SSD is ephemeral and does not survive VM stop/terminate. Durable data belongs on a Persistent Disk; use pd-ssd if high IOPS is still required.",
  wy:{1:"Size doesn't affect durability.",2:"VM size is unrelated.",3:"Local SSDs don't support snapshots."},
  trick:"Local SSD data loss on restart is a top storage trap."},
 {title:"The single point of failure",icon:"⚠️",clue:"An e-commerce site runs on one large VM in us-central1-a behind a static IP. When that zone had an incident, the whole site went down for hours.",
  issue:"Scalability / Availability",q:"Best redesign for resilience?",
  opts:["Buy an even bigger VM","Regional managed instance group across zones behind a load balancer","Add a second static IP","Move to a different single zone"],a:1,
  ex:"A single VM in one zone is a single point of failure. A regional MIG (multi-zone) behind a load balancer gives autohealing, autoscaling, and survives a zonal outage.",
  wy:{0:"Bigger ≠ redundant; still one zone.",2:"IPs don't add fault tolerance.",3:"Another single zone is still a single point of failure."},
  trick:"'One VM, one zone' → regional MIG + LB."},
 {title:"The blocked microservices",icon:"🌐",clue:"Inside a GKE cluster, service B can't reliably reach service A. Service A was exposed with type LoadBalancer and got a public IP, so it's now internet-exposed too.",
  issue:"Networking / GKE",q:"What's the right service type for internal-only comms?",
  opts:["Keep LoadBalancer","Change service A to ClusterIP for internal traffic","Use NodePort","Delete the service"],a:1,
  ex:"For internal-only pod-to-pod communication, use a ClusterIP service — stable internal IP, no public exposure. LoadBalancer needlessly exposed A to the internet.",
  wy:{0:"LoadBalancer exposes A publicly — wrong for internal traffic.",2:"NodePort also exposes externally.",3:"Deleting breaks A."},
  trick:"Internal GKE comms = ClusterIP, not LoadBalancer."},
];
VIEWS.detective=(m)=>{
  m.appendChild(head("Cloud Detective","Find the flaw in a broken design","Each case hides a security, IAM, networking, storage, or scalability defect. Diagnose it, then confirm the fix."));
  const g=el("div","grid g2");
  CASES.forEach((cs,i)=>{ const c=el("div","card"); c.style.cssText="padding:18px;cursor:pointer";
    c.innerHTML='<div style="font-size:28px">'+cs.icon+'</div><h4 style="margin:8px 0 4px">'+esc(cs.title)+'</h4><span class="pill p-red">'+esc(cs.issue)+'</span>';
    c.onclick=()=>openCase(m,i); g.appendChild(c); });
  m.appendChild(g);
};
function openCase(m,i){
  const cs=CASES[i]; m.innerHTML="";
  const v=el("div","view qwrap");
  v.innerHTML='<button class="btn ghost sm" id="dc_back">← Cases</button>'
    +'<h2 style="margin:14px 0 4px">'+cs.icon+' '+esc(cs.title)+'</h2><span class="pill p-red">'+esc(cs.issue)+'</span>'
    +'<div class="card" style="padding:16px;margin:14px 0"><b>🔍 Evidence</b><p style="margin:6px 0 0;font-size:13.5px">'+esc(cs.clue)+'</p></div>'
    +'<h3>'+esc(cs.q)+'</h3><div id="dc_opts" style="margin-top:14px"></div><div id="dc_foot"></div>';
  m.appendChild(v);
  $("#dc_back",v).onclick=()=>go("detective");
  const ob=$("#dc_opts",v), btns=[];
  cs.opts.forEach((o,oi)=>{ const b=el("button","opt"); b.innerHTML='<span class="k">'+"ABCD"[oi]+'</span>'+esc(o);
    b.onclick=()=>{ if(b.disabled)return; btns.forEach((x,xi)=>{x.disabled=true; if(xi===cs.a)x.classList.add("correct"); if(xi===oi&&xi!==cs.a)x.classList.add("wrong");});
      const q={_i:"case"+i,m:"iam",topic:cs.title,a:cs.a,opts:cs.opts,ex:cs.ex,wy:cs.wy,trick:cs.trick,d:2}; recordAnswer(q,oi,0);
      $("#dc_foot",v).appendChild(buildExplain(q,oi));
      if(oi===cs.a){grant("detective");toast("Case cracked! 🕵️");}
      const nx=el("button","btn","Next case →"); nx.style.marginTop="12px"; nx.onclick=()=>openCase(m,(i+1)%CASES.length); $("#dc_foot",v).appendChild(nx);
    }; ob.appendChild(b); btns[oi]=b; });
}

/* ---------- MATCH & DRAG ---------- */
const MATCHSETS=[
 {title:"Service → use case",pairs:[
  ["Cloud Run","Serverless containers, no cluster, scale to zero"],
  ["Cloud Functions","Run code on an event (file upload, message)"],
  ["Bigtable","Millions of IoT / time-series writes per second"],
  ["BigQuery","SQL analytics over petabytes, serverless"],
  ["Memorystore","Sub-millisecond in-memory cache"],
  ["Cloud Spanner","Global relational DB, horizontal write scaling"]]},
 {title:"Storage class → access pattern",pairs:[
  ["Standard","Frequent / hot data"],["Nearline","~ once a month (30-day min)"],
  ["Coldline","~ once a quarter (90-day min)"],["Archive","< once a year (365-day min)"]]},
 {title:"IAM role → what it grants",pairs:[
  ["Storage Object Admin","Manage objects, but NOT create buckets"],
  ["Storage Admin","Buckets AND objects"],
  ["App Engine Deployer","Deploy versions, but NOT shift traffic"],
  ["App Engine Service Admin","Shift traffic, but NOT deploy"],
  ["BigQuery Job User","Run queries/jobs only"]]},
 {title:"Networking product → job",pairs:[
  ["Cloud NAT","Outbound internet for private VMs"],
  ["Cloud VPN","Encrypted tunnel over the internet"],
  ["Dedicated Interconnect","Private high-bandwidth physical link"],
  ["Shared VPC","One host project shares subnets (same org)"],
  ["VPC Peering","Connect VPCs across orgs, decentralized admin"]]},
 {title:"CLI tool → service",pairs:[
  ["gsutil","Cloud Storage"],["bq","BigQuery"],["cbt","Bigtable"],["kubectl","Kubernetes workloads"]]},
];
VIEWS.match=(m,setIdx)=>{
  setIdx=setIdx||0;
  m.appendChild(head("Match & Drag","Wire each item to its meaning","Drag the tiles on the right onto the correct slot on the left. Green = right, red = wrong."));
  const seg=el("div","seg"); MATCHSETS.forEach((s,i)=>{const b=el("button",setIdx===i?"on":"",s.title.split(" ")[0]);b.onclick=()=>go("match",i);seg.appendChild(b);}); m.appendChild(seg);
  const set=MATCHSETS[setIdx];
  const wrap=el("div","matchgrid"); wrap.style.marginTop="16px";
  const left=el("div"), right=el("div");
  left.innerHTML='<div class="navsec" style="margin:0 0 8px">Targets</div>';
  right.innerHTML='<div class="navsec" style="margin:0 0 8px">Drag these →</div>';
  set.pairs.forEach(([a],i)=>{ const d=el("div","drop"); d.dataset.i=i; d.innerHTML='<span class="lbl">'+esc(a)+'</span><span class="drop-val" style="color:var(--ink3)">drop here</span>'; wireDrop(d); left.appendChild(d); });
  shuffle(set.pairs.map((p,i)=>i)).forEach(i=>{ right.appendChild(makeTile(i)); });
  wrap.appendChild(left); wrap.appendChild(right); m.appendChild(wrap);
  const foot=el("div","row"); foot.style.marginTop="16px";
  const chk=el("button","btn","Check answers"); const rb=el("button","btn ghost","Shuffle again"); rb.onclick=()=>go("match",setIdx);
  foot.appendChild(chk); foot.appendChild(rb); m.appendChild(foot);
  const res=el("div"); res.style.marginTop="10px"; m.appendChild(res);
  let dragEl=null;
  function makeTile(i){ const d=el("div","drag"); d.draggable=true; d.dataset.i=i; d.textContent=set.pairs[i][1];
    d.addEventListener("dragstart",()=>{dragEl=d;d.classList.add("dragging");});
    d.addEventListener("dragend",()=>d.classList.remove("dragging")); return d; }
  function wireDrop(d){ d.addEventListener("dragover",e=>{e.preventDefault();d.classList.add("over");});
    d.addEventListener("dragleave",()=>d.classList.remove("over"));
    d.addEventListener("drop",e=>{e.preventDefault();d.classList.remove("over"); if(!dragEl)return;
      if(d.dataset.filled){ right.appendChild(makeTile(d.dataset.fillIdx)); }
      d.dataset.filled="1"; d.dataset.fillIdx=dragEl.dataset.i; d.classList.add("filled");
      const val=d.querySelector(".drop-val"); val.textContent=set.pairs[dragEl.dataset.i][1]; val.style.color="var(--ink)";
      dragEl.remove(); dragEl=null;
    });
  }
  chk.onclick=()=>{ let ok=0,total=set.pairs.length;
    left.querySelectorAll(".drop").forEach(d=>{ d.classList.remove("ok","no");
      if(d.dataset.filled && +d.dataset.fillIdx===+d.dataset.i){ d.classList.add("ok"); ok++; } else if(d.dataset.filled){ d.classList.add("no"); } });
    addXP(ok*4); S.answered+=total; S.correct+=ok; save(); renderHUD();
    res.innerHTML='<div class="explain"><h5 style="color:'+(ok===total?'var(--green)':'var(--ink)')+'">'+ok+' / '+total+' correct'+(ok===total?' — perfect! ✓':'')+'</h5><div>Green slots are right. Red slots are wrong — drag the correct tile in and re-check.</div></div>';
    if(ok===total)toast("Perfect match! 🎯");
  };
};

/* ---------- MEMORY MATCH ---------- */
const MEMSET=[["Cloud Run","Serverless containers"],["Cloud Functions","Event-driven code"],["GKE","Kubernetes clusters"],["App Engine","Managed app platform"],["Bigtable","IoT / time-series"],["Firestore","Mobile document DB"],["Spanner","Global relational"],["BigQuery","SQL analytics"]];
VIEWS.memory=(m)=>{
  m.appendChild(head("Memory Match","Flip & pair confusable services","Flip two cards to match a service with its one-line role. Fewer flips = more XP."));
  const cards=[]; MEMSET.forEach(([a,b],i)=>{cards.push({g:i,t:a});cards.push({g:i,t:b});});
  const deck=shuffle(cards);
  const stats=el("div","row"); stats.style.margin="4px 0 14px"; stats.innerHTML='<span class="chip" id="mm_flips">Flips: 0</span><span class="chip" id="mm_pairs">Pairs: 0/'+MEMSET.length+'</span>'; m.appendChild(stats);
  const grid=el("div","memgrid"); m.appendChild(grid);
  let first=null,lock=false,flips=0,pairs=0;
  deck.forEach((c)=>{ const card=el("div","mcard face-down"); card.dataset.g=c.g;
    card.innerHTML='<span>'+esc(c.t)+'</span>';
    card.onclick=()=>{ if(lock||card.classList.contains("up")||card.classList.contains("done"))return;
      card.classList.remove("face-down"); card.classList.add("up");
      if(!first){first=card;return;}
      flips++; $("#mm_flips").textContent="Flips: "+flips;
      if(first.dataset.g===card.dataset.g){ first.classList.add("done");card.classList.add("done"); first.classList.remove("up");card.classList.remove("up"); pairs++; $("#mm_pairs").textContent="Pairs: "+pairs+"/"+MEMSET.length; first=null; addXP(4);
        if(pairs===MEMSET.length){ toast("Cleared in "+flips+" flips! 🧠"); addXP(Math.max(0,20-(flips-MEMSET.length))); }
      } else { lock=true; setTimeout(()=>{ first.classList.add("face-down");first.classList.remove("up"); card.classList.add("face-down");card.classList.remove("up"); first=null;lock=false; },800); }
    }; grid.appendChild(card);
  });
};

/* ---------- ARCHITECTURE BUILDER ---------- */
const PALETTE=["Compute Engine MIG","Cloud Run","GKE","App Engine","Cloud Functions","Cloud Storage","Persistent Disk","Cloud SQL","Cloud Spanner","Bigtable","Firestore","BigQuery","Memorystore","Pub/Sub","Dataflow","Global HTTP(S) LB","Internal LB","Cloud CDN","Cloud NAT","VPC","Cloud DNS"];
const ARCHSCEN=[
 {title:"Scalable image-upload service",brief:"Users upload images from a web app. Store the originals cheaply and durably, generate thumbnails automatically on each upload, and serve a global audience with low latency.",
  need:["Cloud Storage","Cloud Functions","Global HTTP(S) LB"],good:["Cloud CDN"],
  why:"Cloud Storage holds the durable objects; a Cloud Function triggered on upload creates thumbnails (event-driven, serverless); a Global HTTP(S) LB (ideally + Cloud CDN) serves images with low global latency.",
  wrongIf:{"Persistent Disk":"A single-VM disk can't serve a global, elastic object workload — use Cloud Storage.","Bigtable":"Bigtable is for high-throughput structured data, not image blobs.","Cloud SQL":"A relational DB is the wrong home for image files."}},
 {title:"Decoupled order-processing pipeline",brief:"A checkout service must hand off orders to a slower fulfillment service that occasionally goes down, without losing orders or blocking checkout. Store processed results for SQL analytics.",
  need:["Pub/Sub","Cloud Run","BigQuery"],good:["Dataflow"],
  why:"Pub/Sub decouples checkout from fulfillment and durably buffers orders; Cloud Run processes them; results land in BigQuery for analytics (Dataflow can do the streaming ETL).",
  wrongIf:{"Memorystore":"A cache won't durably retain orders if the consumer is down.","Cloud SQL":"Fine for OLTP, but the requirement is decoupling + analytics — Pub/Sub + BigQuery.","Cloud Spanner":"Overkill and doesn't provide the async decoupling."}},
 {title:"Global, always-consistent banking ledger",brief:"A financial app needs a relational database that stays strongly consistent across multiple continents, scales writes horizontally, and offers 99.999% availability. Cache hot balances for speed.",
  need:["Cloud Spanner","Memorystore","Global HTTP(S) LB"],good:[],
  why:"Cloud Spanner is the only managed relational DB with global strong consistency + horizontal write scaling + 99.999% SLA; Memorystore caches hot reads; a global LB fronts the app.",
  wrongIf:{"Cloud SQL":"Regional and scales writes only vertically — can't meet global 5-nines + horizontal writes.","Bigtable":"Not relational / not strongly-consistent SQL.","Firestore":"Document model, not a relational ledger."}},
 {title:"Resilient stateless web tier",brief:"Host a stateless web application on VMs that auto-scales with load, self-heals failed instances, survives a zone outage, and sits behind one global entry point.",
  need:["Compute Engine MIG","Global HTTP(S) LB"],good:["Cloud NAT"],
  why:"A regional (multi-zone) managed instance group gives autoscaling + autohealing + zonal fault tolerance; a Global HTTP(S) LB provides one anycast entry point. Cloud NAT gives private nodes outbound access.",
  wrongIf:{"Cloud SQL":"Not needed for a stateless tier's compute/availability.","Persistent Disk":"A shared stateless tier shouldn't depend on a single disk.","Bigtable":"Irrelevant to the web-tier availability requirement."}},
];
VIEWS.arch=(m,idx)=>{
  idx=idx||0; const sc=ARCHSCEN[idx];
  m.appendChild(head("Architecture Builder","Design the right stack","Read the business problem, then drag the GCP services you'd use into the canvas. Submit to see whether your design meets the requirement — and why."));
  const seg=el("div","seg"); ARCHSCEN.forEach((s,i)=>{const b=el("button",i===idx?"on":"","Scenario "+(i+1));b.onclick=()=>go("arch",i);seg.appendChild(b);}); m.appendChild(seg);
  const brief=el("div","card"); brief.style.cssText="padding:16px;margin:14px 0"; brief.innerHTML='<b>🏗 '+esc(sc.title)+'</b><p style="margin:6px 0 0;font-size:13.5px">'+esc(sc.brief)+'</p>'; m.appendChild(brief);
  const two=el("div","grid g2");
  const pal=el("div","card"); pal.style.padding="14px"; pal.innerHTML='<div class="navsec" style="margin:0 0 8px">Service palette — drag →</div>'; const palbox=el("div","row"); palbox.style.gap="8px";
  const canvasCard=el("div","card"); canvasCard.style.padding="14px"; canvasCard.innerHTML='<div class="navsec" style="margin:0 0 8px">Your architecture</div>';
  const canvas=el("div","drop"); canvas.style.minHeight="180px"; canvas.innerHTML='<span style="color:var(--ink3)">Drop services here</span>'; canvasCard.appendChild(canvas);
  const chosen=new Set(); let dragT=null;
  PALETTE.forEach(p=>{ const t=el("div","drag"); t.draggable=true; t.textContent=p; t.style.marginBottom="0";
    t.addEventListener("dragstart",()=>dragT=p); palbox.appendChild(t); });
  pal.appendChild(palbox);
  canvas.addEventListener("dragover",e=>{e.preventDefault();canvas.classList.add("over");});
  canvas.addEventListener("dragleave",()=>canvas.classList.remove("over"));
  canvas.addEventListener("drop",e=>{e.preventDefault();canvas.classList.remove("over"); if(dragT&&!chosen.has(dragT)){chosen.add(dragT);drawCanvas();} dragT=null;});
  function drawCanvas(){ canvas.innerHTML=""; if(!chosen.size){canvas.innerHTML='<span style="color:var(--ink3)">Drop services here</span>';return;}
    chosen.forEach(c=>{ const chip=el("span","chip"); chip.style.cssText="background:var(--accentbg);color:var(--blue);cursor:pointer"; chip.textContent=c+" ✕"; chip.onclick=()=>{chosen.delete(c);drawCanvas();}; canvas.appendChild(chip); }); }
  two.appendChild(pal); two.appendChild(canvasCard); m.appendChild(two);
  const foot=el("div","row"); foot.style.marginTop="16px"; const sub=el("button","btn","Submit design"); foot.appendChild(sub); m.appendChild(foot);
  const res=el("div"); res.style.marginTop="12px"; m.appendChild(res);
  sub.onclick=()=>{
    const have=[...chosen]; const missing=sc.need.filter(n=>!chosen.has(n));
    const wrongPicks=have.filter(h=>!sc.need.includes(h)&&!sc.good.includes(h)&&sc.wrongIf[h]);
    const pass=missing.length===0 && wrongPicks.length===0;
    const bonus=sc.good.filter(g=>chosen.has(g));
    addXP(pass?24:Math.max(4,(sc.need.length-missing.length)*5));
    S.answered++; if(pass)S.correct++; save(); renderHUD();
    let h='<div class="explain"><h5 style="color:'+(pass?'var(--green)':'var(--red)')+'">'+(pass?'✓ Solid design!':'✗ Not quite — see below')+'</h5><div><b>Reference design:</b> '+esc(sc.why)+'</div>';
    if(missing.length)h+='<div class="whywrong" style="margin-top:8px"><b style="color:var(--red)">Missing essentials</b>'+missing.map(x=>'<div>'+esc(x)+'</div>').join("")+'</div>';
    if(wrongPicks.length){h+='<div class="whywrong" style="margin-top:8px"><b style="color:var(--red)">Poor fits you added</b>'+wrongPicks.map(x=>'<div><b>'+esc(x)+':</b> '+esc(sc.wrongIf[x])+'</div>').join("")+'</div>';}
    if(bonus.length)h+='<div class="trickbox" style="margin-top:8px"><b>👍 Nice touch:</b> '+bonus.map(esc).join(", ")+' improves the design.</div>';
    h+='</div>'; res.innerHTML=h; if(pass)toast("Architecture approved! 🏗");
  };
};

/* ================= EXAM ENGINE ================= */
VIEWS.boss=(m)=>{
  m.appendChild(head("Boss Battle","The final exam","A full 50-question adaptive gauntlet mixing every domain — scenario-heavy, cost, security, networking and troubleshooting. No going back; answer and learn."));
  const c=el("div","card"); c.style.cssText="padding:24px;text-align:center;max-width:540px;margin:12px auto";
  c.innerHTML='<div style="font-size:48px">👑</div><h3 style="margin:8px 0 4px">50 questions · adaptive · no timer</h3>'
    +'<p class="sub" style="margin:0 auto 8px">Difficulty rises as you answer correctly and eases where you struggle. Full explanations after each. Ends with a domain-by-domain readiness report.</p>'
    +(S.lastExam?'<p class="chip" style="margin:6px 0 16px">Last score: '+S.lastExam.pct+'% ('+fmtTime(S.lastExam.ts)+')</p>':'');
  const b=el("button","btn","Enter the Boss Battle"); b.onclick=()=>startExam({n:50,title:"Boss Battle",adaptive:true,mode:"boss"}); c.appendChild(b);
  m.appendChild(c);
};
VIEWS.sim=(m)=>{
  m.appendChild(head("ACE Exam Simulator","Test-day conditions","Configure a realistic exam: choose length and timer, flag questions, skip and return, review everything before submitting, then get a domain breakdown and pass probability."));
  const c=el("div","card"); c.style.cssText="padding:22px;max-width:560px;margin:10px auto";
  c.innerHTML='<h3 style="font-size:16px;margin-bottom:14px">Exam settings</h3>';
  const mkSel=(label,opts)=>{ const w=el("div"); w.style.marginBottom="14px";
    w.innerHTML='<div style="font-size:12px;font-weight:700;color:var(--ink2);margin-bottom:6px">'+label+'</div>';
    const seg=el("div","seg"); opts.forEach((o,i)=>{const b=el("button",i===0?"on":"",o.l);b.dataset.v=o.v;b.onclick=()=>{[...seg.children].forEach(x=>x.classList.remove("on"));b.classList.add("on");};seg.appendChild(b);}); w.appendChild(seg); return w; };
  const nSel=mkSel("Number of questions",[{l:"20",v:20},{l:"30",v:30},{l:"50",v:50}]);
  const tSel=mkSel("Timer",[{l:"Off",v:0},{l:"20s / Q",v:20},{l:"Exam pace (2h/50)",v:144}]);
  c.appendChild(nSel); c.appendChild(tSel);
  const b=el("button","btn","Begin exam"); c.appendChild(b);
  b.onclick=()=>{ const n=+nSel.querySelector(".on").dataset.v; const t=+tSel.querySelector(".on").dataset.v;
    startExam({n,title:"Exam Simulator",timedSecs:t,flagging:true,reviewFirst:true,mode:"sim"}); };
  m.appendChild(c);
};
function startExam(cfg){
  let base=shuffle(Q.map((_,i)=>i));
  let list=[]; while(list.length<cfg.n){ list=list.concat(base); } list=list.slice(0,cfg.n);
  const st={cfg,list,idx:0,answers:new Array(cfg.n).fill(null),flags:new Set(),startTs:Date.now(),done:false,adaptDiff:2};
  go("__exam"); renderExam(document.getElementById("main"),st);
}
VIEWS.__exam=(m)=>{ m.innerHTML='<div class="empty">Loading exam…</div>'; };
function renderExam(m,st){
  if(st._timer){ clearInterval(st._timer); st._timer=null; }
  m.innerHTML="";
  if(st.reviewing){ return examReview(m,st); }
  if(st.done){ return examResult(m,st); }
  const {cfg,list,idx}=st;
  if(cfg.adaptive && st.answers[idx]===null){
    const want=st.adaptDiff;
    const cand=list.map((qi,pos)=>({pos,qi})).filter(x=>x.pos>=idx && st.answers[x.pos]===null && Q[x.qi].d===want);
    if(cand.length){ const pick=cand[0]; const tmp=list[idx]; list[idx]=list[pick.pos]; list[pick.pos]=tmp; }
  }
  const q=Q[list[idx]];
  const v=el("div","view qwrap");
  const answeredCount=st.answers.filter(a=>a!==null).length;
  const meta=el("div","qmeta");
  meta.innerHTML='<span><b>'+esc(cfg.title)+'</b> · Q'+(idx+1)+'/'+cfg.n+' · answered '+answeredCount+'</span>'
    +'<span class="pill p-blue">'+MODNAME[q.m]+'</span>';
  v.appendChild(meta);
  const pb=el("div","bar"); pb.style.marginBottom="14px"; pb.innerHTML='<i style="width:'+(answeredCount/cfg.n*100)+'%"></i>'; v.appendChild(pb);

  let timer,timerBar;
  if(cfg.timedSecs){ timerBar=el("div","timerbar"); timerBar.innerHTML='<i></i>'; v.appendChild(timerBar); }

  v.appendChild(el("h3",null,esc(q.q)));
  const optbox=el("div"); optbox.style.marginTop="14px"; const btns=[];
  const prev=st.answers[idx];
  q.opts.forEach((o,oi)=>{ const b=el("button","opt"); b.innerHTML='<span class="k">'+"ABCD"[oi]+'</span>'+esc(o);
    if(prev!==null){ b.disabled=true;
      if(cfg.mode==="boss"){ if(oi===q.a)b.classList.add("correct"); if(oi===prev.chosen&&!prev.ok)b.classList.add("wrong"); }
      else if(oi===prev.chosen){ b.style.borderColor="var(--blue)"; b.style.background="var(--accentbg)"; } }
    b.onclick=()=>choose(oi); optbox.appendChild(b); btns[oi]=b; });
  v.appendChild(optbox);
  const foot=el("div"); foot.style.marginTop="12px"; v.appendChild(foot);
  if(prev!==null && cfg.mode==="boss"){ foot.appendChild(buildExplain(q,prev.chosen)); }

  const nav=el("div","row"); nav.style.marginTop="16px";
  if(idx>0){ const p=el("button","btn ghost sm","← Prev"); p.onclick=()=>{st.idx--;renderExam(m,st);}; nav.appendChild(p); }
  if(cfg.flagging){ const f=el("button","btn ghost sm",(st.flags.has(idx)?"🚩 Unflag":"⚑ Flag")); f.onclick=()=>{ if(st.flags.has(idx))st.flags.delete(idx); else st.flags.add(idx); renderExam(m,st); }; nav.appendChild(f); }
  const skip=el("button","btn ghost sm",idx+1<cfg.n?"Skip →":"To review"); skip.onclick=()=>advance(); nav.appendChild(skip);
  const nextBtn=el("button","btn sm",idx+1<cfg.n?"Next →":(cfg.reviewFirst?"Review answers":"Finish")); nextBtn.onclick=()=>advance();
  nav.appendChild(nextBtn);
  v.appendChild(nav);

  if(cfg.flagging){
    const grid=el("div"); grid.style.cssText="display:flex;flex-wrap:wrap;gap:6px;margin-top:18px";
    for(let i=0;i<cfg.n;i++){ const b=el("button"); b.textContent=i+1;
      b.style.cssText="width:30px;height:30px;border-radius:8px;border:1px solid var(--line);font-size:11px;font-weight:700;font-variant-numeric:tabular-nums;"
        +(i===idx?"outline:2px solid var(--blue);":"")
        +(st.answers[i]!==null?"background:var(--accentbg);color:var(--blue);":"background:var(--surface);color:var(--ink3);")
        +(st.flags.has(i)?"border-color:var(--yellow);":"");
      b.onclick=()=>{st.idx=i;renderExam(m,st);}; grid.appendChild(b); }
    v.appendChild(grid);
  }
  m.appendChild(v);

  if(cfg.timedSecs){ let left=cfg.timedSecs; const bar=timerBar.firstChild;
    timer=setInterval(()=>{ left--; bar.style.width=Math.max(0,left/cfg.timedSecs*100)+"%";
      if(left<=0){ clearInterval(timer); if(st.answers[idx]===null){ choose(-1,true); } else advance(); } },1000);
    st._timer=timer;
  }
  function choose(oi,timeout){
    if(st.answers[idx]!==null) return;
    if(timer)clearInterval(timer);
    const chosen= oi===-1? (q.a===0?1:0) : oi;
    const ok= oi===q.a;
    st.answers[idx]={chosen,ok, timeout:!!timeout};
    recordAnswer(q,chosen,0);
    st.adaptDiff = ok? Math.min(3,st.adaptDiff+ (Math.random()<.6?1:0)) : Math.max(1,st.adaptDiff-1);
    if(cfg.mode==="boss"){ renderExam(m,st); }
    else { btns.forEach((b,i)=>{ b.style.borderColor = i===chosen? "var(--blue)":"var(--line)"; b.style.background=i===chosen?"var(--accentbg)":"var(--surface)"; b.disabled=true; });
      setTimeout(()=>advance(),250);
    }
  }
  function advance(){ if(timer)clearInterval(timer);
    if(idx+1<cfg.n){ st.idx++; renderExam(m,st); }
    else if(cfg.reviewFirst){ st.reviewing=true; renderExam(m,st); }
    else finishExam(st,m);
  }
}
function examReview(m,st){
  const {cfg}=st; const answered=st.answers.filter(a=>a!==null).length;
  const v=el("div","view qwrap");
  v.innerHTML='<h2 style="margin-bottom:4px">Review before submitting</h2><p class="sub">You answered '+answered+' of '+cfg.n+'. '+st.flags.size+' flagged. Jump back to any question or submit now.</p>';
  const grid=el("div"); grid.style.cssText="display:flex;flex-wrap:wrap;gap:6px;margin:16px 0";
  for(let i=0;i<cfg.n;i++){ const b=el("button"); b.textContent=(st.flags.has(i)?"🚩":"")+(i+1);
    b.style.cssText="min-width:34px;height:34px;padding:0 6px;border-radius:8px;border:1px solid var(--line);font-size:11px;font-weight:700;"
      +(st.answers[i]!==null?"background:var(--accentbg);color:var(--blue);":"background:var(--surface);color:var(--ink3);")
      +(st.flags.has(i)?"border-color:var(--yellow);":"");
    b.onclick=()=>{st.reviewing=false;st.idx=i;renderExam(m,st);}; grid.appendChild(b); }
  v.appendChild(grid);
  const row=el("div","row");
  const back=el("button","btn ghost","← Keep working"); back.onclick=()=>{st.reviewing=false;st.idx=st.answers.findIndex(a=>a===null); if(st.idx<0)st.idx=0; renderExam(m,st);};
  const sub=el("button","btn","Submit exam ✓"); sub.onclick=()=>{ if(answered<cfg.n && !confirm((cfg.n-answered)+" question(s) unanswered will be marked wrong. Submit anyway?"))return; finishExam(st,m); };
  row.appendChild(back); row.appendChild(sub); v.appendChild(row);
  m.innerHTML=""; m.appendChild(v);
}
function finishExam(st,m){
  st.done=true; st.reviewing=false;
  let right=0; const perDom={}; MODULES.forEach(md=>perDom[md.id]={s:0,r:0});
  st.list.forEach((qi,i)=>{ const q=Q[qi]; const a=st.answers[i]; perDom[q.m].s++; if(a&&a.ok){right++;perDom[q.m].r++;} });
  const pct=Math.round(right/st.cfg.n*100);
  st.result={right,pct,perDom,secs:Math.round((Date.now()-st.startTs)/1000)};
  S.lastExam={pct,ts:Date.now(),n:st.cfg.n};
  S.history.push({ts:Date.now(),acc:pct}); if(S.history.length>50)S.history.shift();
  grant("exam"); if(pct>=80)grant("exampass"); save();
  renderExam(m,st);
}
function examResult(m,st){
  const {result:r,cfg}=st;
  const doms=Object.entries(r.perDom).filter(([k,v])=>v.s>0).map(([k,v])=>({k,name:MODNAME[k],pct:Math.round(v.r/v.s*100),n:v.s}));
  const weak=doms.slice().sort((a,b)=>a.pct-b.pct).slice(0,3);
  const strong=doms.slice().sort((a,b)=>b.pct-a.pct).slice(0,3);
  const passProb= r.pct>=85?"Very high":r.pct>=75?"High":r.pct>=65?"Moderate":r.pct>=50?"Low":"Very low";
  const conf= r.pct>=80?"You're tracking to pass — keep sharpening weak domains.": r.pct>=65?"Borderline. Focus revision on your bottom domains and re-sit.":"Not ready yet — return to concept pages and High-Yield drills.";
  const v=el("div","view");
  v.innerHTML='<div class="eyebrow">'+esc(cfg.title)+' complete</div><h1 class="h-title">Exam report</h1>';
  const top=el("div","grid g2"); top.style.margin="16px 0";
  const scoreCard=el("div","card"); scoreCard.style.cssText="padding:22px;display:flex;gap:20px;align-items:center";
  scoreCard.innerHTML='<div style="position:relative;width:130px;height:130px;flex-shrink:0">'+ring(r.pct,130,r.pct>=80?"var(--green)":r.pct>=65?"var(--yellow)":"var(--red)")
    +'<div style="position:absolute;inset:0;display:grid;place-items:center"><div><div style="font-size:32px;font-weight:800" class="tnum">'+r.pct+'%</div><div style="font-size:11px;color:var(--ink3)">'+r.right+'/'+cfg.n+'</div></div></div></div>'
    +'<div><h3 style="margin-bottom:4px">'+(r.pct>=80?"Pass-ready 🎯":r.pct>=65?"Almost there 💪":"Keep building 📚")+'</h3>'
    +'<p class="sub" style="font-size:13px;margin-bottom:8px">'+conf+'</p>'
    +'<div class="chip">⏱ '+Math.floor(r.secs/60)+'m '+(r.secs%60)+'s</div> <div class="chip">Pass probability: <b>'+passProb+'</b></div></div>';
  top.appendChild(scoreCard);
  const readyCard=el("div","card"); readyCard.style.cssText="padding:22px;text-align:center;display:flex;flex-direction:column;justify-content:center";
  const rr=readiness();
  readyCard.innerHTML='<div style="font-size:12px;text-transform:uppercase;letter-spacing:.7px;color:var(--ink3);font-weight:700">Overall ACE readiness</div>'
    +'<div style="font-size:44px;font-weight:800;color:'+(rr>=80?'var(--green)':rr>=60?'var(--yellow)':'var(--red)')+'" class="tnum">'+rr+'%</div>'
    +'<div class="bar" style="margin-top:8px"><i style="width:'+rr+'%;background:'+(rr>=80?'var(--green)':'var(--yellow)')+'"></i></div>';
  top.appendChild(readyCard); v.appendChild(top);

  const dc=el("div","card"); dc.style.cssText="padding:18px;margin-bottom:16px"; dc.innerHTML='<h3 style="font-size:15px;margin-bottom:12px">Domain breakdown</h3>';
  doms.sort((a,b)=>a.pct-b.pct).forEach(d=>{ const row=el("div","barrow");
    row.innerHTML='<span class="nm">'+esc(d.name)+'</span><div class="track"><i style="width:'+d.pct+'%;background:'+(d.pct>=70?"var(--green)":d.pct>=40?"var(--yellow)":"var(--red)")+'"></i></div><span class="pct tnum">'+d.pct+'%</span>';
    dc.appendChild(row); }); v.appendChild(dc);

  const two=el("div","grid g2");
  const wk=el("div","card"); wk.style.padding="18px"; wk.innerHTML='<h3 style="font-size:15px;margin-bottom:8px">🔴 Revise first</h3>';
  weak.forEach(d=>{ const b=el("button","opt"); b.style.marginBottom="8px"; b.innerHTML='<b>'+esc(d.name)+'</b> — '+d.pct+'%'; b.onclick=()=>go("modview",d.k); wk.appendChild(b); });
  const sg=el("div","card"); sg.style.padding="18px"; sg.innerHTML='<h3 style="font-size:15px;margin-bottom:8px">🟢 Strongest</h3>';
  strong.forEach(d=>{ sg.appendChild(el("div","chip","✓ "+d.name+" · "+d.pct+"%")); });
  const order=el("div"); order.style.marginTop="12px"; order.innerHTML='<div style="font-size:12px;font-weight:700;color:var(--ink2);margin-bottom:6px">Recommended study order</div>';
  weak.concat(doms.slice(3)).slice(0,5).forEach((d,i)=>order.appendChild(el("div","chip",(i+1)+". "+d.name)));
  sg.appendChild(order);
  two.appendChild(wk); two.appendChild(sg); v.appendChild(two);

  const row=el("div","row"); row.style.marginTop="18px";
  const retry=el("button","btn","Retake"); retry.onclick=()=>startExam(cfg);
  const rev=el("button","btn ghost","Review each question"); rev.onclick=()=>examQuestionReview(m,st);
  const nb=el("button","btn ghost","Mistake Notebook 📓"); nb.onclick=()=>go("mistakes");
  row.appendChild(retry); row.appendChild(rev); row.appendChild(nb); v.appendChild(row);
  m.innerHTML=""; m.appendChild(v);
}
function examQuestionReview(m,st){
  const v=el("div","view qwrap");
  v.innerHTML='<button class="btn ghost sm" id="er_back">← Report</button><h2 style="margin:12px 0">Answer review</h2>';
  st.list.forEach((qi,i)=>{ const q=Q[qi]; const a=st.answers[i];
    const d=el("details","accordion"); const ok=a&&a.ok;
    d.innerHTML='<summary><span><span style="color:'+(ok?'var(--green)':'var(--red)')+';font-weight:800">'+(ok?'✓':'✗')+'</span> Q'+(i+1)+' · '+esc(q.topic)+'</span><span style="font-size:11px;color:var(--ink3)">'+MODNAME[q.m]+'</span></summary>';
    const body=el("div","body"); body.innerHTML='<p style="margin:0 0 8px"><b>'+esc(q.q)+'</b></p>'; body.appendChild(buildExplain(q,a?a.chosen:-1)); d.appendChild(body); v.appendChild(d); });
  m.innerHTML=""; m.appendChild(v); $("#er_back",v).onclick=()=>examResult(m,st);
}

/* ================= INSIGHTS ================= */
VIEWS.insights=(m)=>{
  m.appendChild(head("Exam insights","Your performance analytics","Everything the platform knows about your progress — accuracy, speed, mastery, improvement over time, and readiness."));
  const avgT=S.timeN?Math.round(S.timeSum/S.timeN):0;
  const kpis=el("div","grid g4"); kpis.style.margin="4px 0 18px";
  [["Answered",S.answered],["Accuracy",overallAcc()==null?"—":overallAcc()+"%"],["Avg time",avgT?avgT+"s":"—"],["ACE readiness",readiness()+"%"]].forEach(([l,n])=>{const c=el("div","card kpi");c.innerHTML='<div class="n tnum">'+n+'</div><div class="l">'+l+'</div>';kpis.appendChild(c);}); m.appendChild(kpis);

  const chart=el("div","card"); chart.style.padding="18px"; chart.innerHTML='<h3 style="font-size:15px;margin-bottom:10px">Improvement over time (exam scores)</h3>';
  if(S.history.length<2){ chart.innerHTML+='<p class="empty">Take a couple of exams to see your trend line.</p>'; }
  else{ chart.innerHTML+=lineChart(S.history.map(h=>h.acc)); }
  m.appendChild(chart);

  const two=el("div","grid g2"); two.style.marginTop="16px";
  const mast=el("div","card"); mast.style.padding="18px"; mast.innerHTML='<h3 style="font-size:15px;margin-bottom:12px">Mastery by module</h3>';
  MODULES.forEach(md=>{const p=modMastery(md.id);const row=el("div","barrow");row.innerHTML='<span class="nm">'+md.icon+' '+md.name+'</span><div class="track"><i style="width:'+p+'%;background:'+(p>=70?"var(--green)":p>=40?"var(--yellow)":"var(--red)")+'"></i></div><span class="pct tnum">'+p+'%</span>';mast.appendChild(row);}); two.appendChild(mast);

  const svc=el("div","card"); svc.style.padding="18px";
  const topics=Object.entries(S.topic).map(([k,t])=>({k,name:k.split("|")[1],acc:Math.round(t.right/t.seen*100),seen:t.seen})).filter(t=>t.seen>=1);
  const strong=topics.slice().sort((a,b)=>b.acc-a.acc).slice(0,5);
  const weak=topics.slice().sort((a,b)=>a.acc-b.acc).slice(0,5);
  svc.innerHTML='<h3 style="font-size:15px;margin-bottom:10px">Strongest & weakest topics</h3>';
  if(!topics.length) svc.innerHTML+='<p class="empty">Practice some questions to populate this.</p>';
  else{ svc.innerHTML+='<div style="font-size:12px;font-weight:700;color:var(--green);margin-bottom:4px">Strongest</div>';
    strong.forEach(t=>svc.appendChild(el("div","chip","✓ "+t.name+" "+t.acc+"%")));
    svc.innerHTML+='<div style="font-size:12px;font-weight:700;color:var(--red);margin:10px 0 4px">Weakest</div>';
    const wl=el("div"); weak.forEach(t=>{const c=el("span","chip");c.style.cssText="cursor:pointer;background:var(--redbg);color:var(--red)";c.textContent="↻ "+t.name+" "+t.acc+"%";c.onclick=()=>startQuiz({topics:[t.k],title:t.name,n:5});wl.appendChild(c);}); svc.appendChild(wl); }
  two.appendChild(svc); m.appendChild(two);
};
function lineChart(vals){
  const w=600,h=160,pad=24; const max=100,min=0;
  const step=(w-pad*2)/(Math.max(1,vals.length-1));
  const pts=vals.map((v,i)=>[pad+i*step, h-pad-(v-min)/(max-min)*(h-pad*2)]);
  const path=pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ");
  const area=path+" L"+pts[pts.length-1][0].toFixed(1)+" "+(h-pad)+" L"+pad+" "+(h-pad)+" Z";
  let grid=""; [0,25,50,75,100].forEach(g=>{const y=h-pad-(g/100)*(h-pad*2);grid+='<line x1="'+pad+'" y1="'+y+'" x2="'+(w-pad)+'" y2="'+y+'" stroke="var(--line)" stroke-width="1"/><text x="4" y="'+(y+3)+'" font-size="9" fill="var(--ink3)">'+g+'</text>';});
  const dots=pts.map(p=>'<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="3.5" fill="var(--blue)"/>').join("");
  return '<div class="tblwrap" style="border:0"><svg viewBox="0 0 '+w+' '+h+'" style="width:100%;height:auto;min-width:420px">'+grid
    +'<path d="'+area+'" fill="var(--accentbg)" opacity=".7"/>'
    +'<path d="'+path+'" fill="none" stroke="var(--blue)" stroke-width="2.5" stroke-linejoin="round"/>'+dots+'</svg></div>';
}

/* ================= MISTAKE NOTEBOOK ================= */
VIEWS.mistakes=(m)=>{
  m.appendChild(head("Mistake Notebook","Learn from every miss","Every wrong answer is logged with the misconception, the distractor you picked, and how often you've repeated it. Clear one once you've truly learned it."));
  if(!S.mistakes.length){ m.appendChild(el("div","empty","🎉 No mistakes logged yet. Play some games — misses will collect here so you can crush them.")); return; }
  const bar=el("div","row"); bar.style.margin="4px 0 16px";
  const drill=el("button","btn","↻ Drill my mistakes");
  drill.onclick=()=>{ const topics=[...new Set(S.mistakes.map(x=>x.m+"|"+x.topic))]; startQuiz({topics,title:"Mistake drill",n:Math.min(10,topics.length*2)}); };
  const clr=el("button","btn ghost","Clear all");
  clr.onclick=()=>{ if(confirm("Clear the whole notebook?")){ S.mistakes=[]; save(); go("mistakes"); } };
  bar.appendChild(drill); bar.appendChild(clr); m.appendChild(bar);
  const repeat=S.mistakes.filter(x=>x.count>=2);
  if(repeat.length){ const rc=el("div","card"); rc.style.cssText="padding:14px;margin-bottom:16px;border-color:var(--red)";
    rc.innerHTML='<b style="color:var(--red)">⚠ Repeat offenders</b><p style="font-size:12.5px;color:var(--ink2);margin:6px 0 0">You\'ve missed these '+repeat.length+' concept(s) more than once — they\'re auto-prioritized in your adaptive practice.</p>';
    const w=el("div","row");w.style.marginTop="8px"; repeat.forEach(x=>w.appendChild(el("span","chip","×"+x.count+" "+esc(x.topic)))); rc.appendChild(w); m.appendChild(rc); }
  S.mistakes.forEach((x)=>{ const d=el("details","accordion");
    d.innerHTML='<summary><span><span class="pill p-red">'+MODNAME[x.m]+'</span> '+esc(x.topic)+(x.count>1?' <span class="chip" style="background:var(--redbg);color:var(--red)">×'+x.count+'</span>':'')+'</span><span style="font-size:11px;color:var(--ink3)">'+fmtTime(x.ts)+'</span></summary>';
    const body=el("div","body");
    body.innerHTML='<p style="margin:0 0 10px"><b>'+esc(x.q)+'</b></p>'
      +'<div style="font-size:13px;margin-bottom:6px"><span style="color:var(--red)">✗ You chose:</span> '+esc(x.chosenTxt||"—")+'</div>'
      +'<div style="font-size:13px;margin-bottom:10px"><span style="color:var(--green)">✓ Correct:</span> '+esc(x.correctTxt||"")+'</div>'
      +'<div class="explain" style="margin-top:0"><b>Why your pick was wrong:</b> '+esc(x.why)+(x.trick?'<div class="trickbox" style="margin-top:8px"><b>🎯 Trick:</b> '+esc(x.trick)+'</div>':'')+'</div>';
    const acts=el("div","row"); acts.style.marginTop="10px";
    const pr=el("button","btn ghost sm","Practice this topic"); pr.onclick=()=>startQuiz({topics:[x.m+"|"+x.topic],title:x.topic,n:5});
    const done=el("button","btn ghost sm","✓ I've learned this"); done.onclick=()=>{ S.mistakes.splice(S.mistakes.indexOf(x),1); grant("nomistakes"); save(); go("mistakes"); toast("Cleared from notebook."); };
    acts.appendChild(pr); acts.appendChild(done); body.appendChild(acts);
    d.appendChild(body); m.appendChild(d);
  });
};

/* ================= CLOUD SYNC BRIDGE ================= */
window.ACE={
  get:()=>S,
  meta:()=>({xp:S.xp, readiness:readiness(), accuracy:overallAcc()||0, answered:S.answered, updatedAt:S.updatedAt||0}),
  load:(o)=>{ if(o&&typeof o==="object"){ S=Object.assign(DEF(),o); try{localStorage.setItem(LS,JSON.stringify(S));}catch(e){} applyTheme(); renderHUD(); go(CUR); } },
};

/* ================= BOOT ================= */
applyTheme(); renderHUD(); renderSide("dash"); go("dash");
try{ window.dispatchEvent(new Event("ace:ready")); }catch(e){}
