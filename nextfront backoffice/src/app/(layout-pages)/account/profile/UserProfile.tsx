import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Phone, MessageCircle, User, HelpCircle, Code2, Flag, Clock,
         FileText, Users, Rocket, ShieldCheck, AlertTriangle,
         Send, Home, CheckCircle2, Briefcase, BarChart3,
        Facebook, Twitter, Instagram, Linkedin, Youtube, Music, Pin, PenTool, Cloud, Shield } from "lucide-react"

const glassBadge =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl text-foreground";    
  
const glassButton =
  "border border-white/10 text-foreground bg-white/[0.04] backdrop-blur-xl hover:bg-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.15)]";  

export default function UserProfile() {
    
    return (
        <div className="user-profile-page">

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 xl:col-span-12">
                    <Card className="overflow-hidden">

                        {/* Gradient Cover */}
                        <div
                            className="
                                h-[150px]
                                border-b border-white/10
                                bg-white/[0.03]
                                backdrop-blur-2xl
                                relative
                                overflow-hidden
                            "
                            >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent" />
                            </div>

                        <CardContent className="flex flex-col sm:flex-row sm:items-center gap-6 p-6">

                            {/* Profile Image */}
                            <div className="relative -mt-16 flex flex-shrink-0 mt-0">
                                <img
                                    src="https://randomuser.me/api/portraits/men/34.jpg"
                                    alt="John Doe"
                                    className="
                                        w-28 h-28
                                        rounded-full
                                        border border-white/10
                                        bg-white/[0.04]
                                        backdrop-blur-xl
                                        shadow-[0_8px_32px_rgba(0,0,0,0.15)]
                                        "
                                />
                            </div>

                            {/* Profile Info */}
                            <div>
                                <h4 className="text-xl font-semibold">John Doe</h4>
                                <p className="text-muted-foreground text-sm font-medium">
                                    UX Designer • Vatican City • Joined April 2021
                                </p>

                                <div className="flex flex-wrap gap-2 mt-3">
                                    <Badge className={glassBadge}>
                                        13.5k Tasks
                                    </Badge>

                                    <Badge className={glassBadge}>
                                        146 Projects
                                    </Badge>

                                    <Badge className={glassBadge}>
                                        897 Connections
                                    </Badge>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="sm:ml-auto flex gap-3">
                                <Button className={glassButton}>
                                    <Phone className="w-4 h-4 mr-2" />
                                    Get In Touch
                                </Button>
                                <Button className={glassButton}>
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Message
                                </Button>
                            </div>

                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-12 xl:col-span-4 space-y-6">
                    <Card>
                        <CardContent className="p-6">

                            <h5 className="mb-4 text-lg font-semibold">About</h5>

                            <div className="space-y-4 text-sm">

                                <div className="flex items-center gap-3">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span><span className="font-medium">Full Name:</span> Emily Carter</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                                    <span><span className="font-medium">Status:</span> Active</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Code2 className="w-4 h-4 text-muted-foreground" />
                                    <span><span className="font-medium">Role:</span> Frontend Developer</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Flag className="w-4 h-4 text-muted-foreground" />
                                    <span><span className="font-medium">Location:</span> Austin, Texas</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                                    <span><span className="font-medium">Languages:</span> English, Spanish</span>
                                </div>

                            </div>

                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">

                            <h5 className="mb-4 text-lg font-semibold">Contacts</h5>

                            <div className="space-y-4 text-sm">

                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <span>
                                        <span className="font-medium">Phone:</span> (415) 987-6543
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span>
                                        <span className="font-medium">Skype:</span> emily.carter
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Send className="w-4 h-4 text-muted-foreground" />
                                    <span>
                                        <span className="font-medium">Email:</span> emily.carter@techhub.com
                                    </span>
                                </div>

                            </div>

                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">

                            <h5 className="mb-4 text-lg font-semibold">Teams</h5>

                            <div className="space-y-5 text-sm">

                                {/* Backend Team */}
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full
                                      bg-primary/10 text-primary-500">
                                        <Code2 className="w-5 h-5" />
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="font-medium">Backend Developers</span>
                                        <span className="text-muted-foreground text-xs">
                                            126 members
                                        </span>
                                    </div>

                                    <Badge
                                        variant="secondary"
                                        className="ml-auto rounded-full bg-primary/10 text-primary-500"
                                    >
                                        Backend
                                    </Badge>
                                </div>

                                {/* React Team */}
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary-500">
                                        <Home className="w-5 h-5" />
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="font-medium">React Developers</span>
                                        <span className="text-muted-foreground text-xs">
                                            98 members
                                        </span>
                                    </div>

                                    <Badge
                                        className="ml-auto rounded-full bg-primary/10 text-primary-500"
                                    >
                                        Frontend
                                    </Badge>
                                </div>

                            </div>

                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">

                            <h5 className="mb-4 text-lg font-semibold">Overview</h5>

                            <div className="space-y-4 text-sm">

                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>
                                        <span className="font-medium">Tasks Completed:</span> 18,240
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Briefcase className="w-4 h-4" />
                                    <span>
                                        <span className="font-medium">Active Projects:</span> 12
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <BarChart3 className="w-4 h-4" />
                                    <span>
                                        <span className="font-medium">Performance Score:</span> 92%
                                    </span>
                                </div>

                            </div>

                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <h5 className="mb-4 text-lg font-semibold">Skills</h5>
                             <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="px-3 py-1.5 rounded-full">
                                    JavaScript
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1.5 rounded-full">
                                    React
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1.5 rounded-full">
                                    Node.js
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1.5 rounded-full">
                                    CSS
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1.5 rounded-full">
                                    UI/UX Design
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1.5 rounded-full">
                                    Project Management
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1.5 rounded-full">
                                    Agile Methodologies
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1.5 rounded-full">
                                    Git
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1.5 rounded-full">
                                    Docker
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1.5 rounded-full">
                                    Kubernetes
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                <div className="col-span-12 xl:col-span-8 space-y-6">
                    <Card>
                        <CardContent className="p-6">

                            <h5 className="mb-6 text-lg font-semibold">Activity Timeline</h5>

                            <div className="relative space-y-8 pl-10">

                                {/* Monthly Report */}
                                <div className="relative">
                                    <span className="absolute -left-[40px] flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary-500">
                                        <FileText className="w-4 h-4" />
                                    </span>
                                    <h6 className="font-semibold">Monthly Report Uploaded</h6>
                                    <p className="text-sm text-muted-foreground">
                                        The finance team submitted the September report
                                    </p>
                                    <Badge variant="secondary" className="mt-2 rounded-md">
                                        report-sept.pdf
                                    </Badge>
                                    <p className="text-xs text-muted-foreground mt-2">10 min ago</p>
                                </div>

                                {/* Standup */}
                                <div className="relative">
                                    <span className="absolute -left-[40px] flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary-500 shadow-md">
                                        <Users className="w-4 h-4" />
                                    </span>
                                    <h6 className="font-semibold">Team Standup Completed</h6>
                                    <p className="text-sm text-muted-foreground">
                                        Daily sync with the product team wrapped up
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">35 min ago</p>
                                </div>

                                {/* Feature Deploy */}
                                <div className="relative">
                                    <span className="absolute -left-[40px] flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary-500 shadow-md">
                                        <Rocket className="w-4 h-4" />
                                    </span>
                                    <h6 className="font-semibold">New Feature Deployed</h6>
                                    <p className="text-sm text-muted-foreground">
                                        Dark mode toggle added to dashboard settings
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">1 day ago</p>
                                </div>

                                {/* Security Patch */}
                                <div className="relative">
                                    <span className="absolute -left-[40px] flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary-500 shadow-md">
                                        <ShieldCheck className="w-4 h-4" />
                                    </span>
                                    <h6 className="font-semibold">Security Patch Released</h6>
                                    <p className="text-sm text-muted-foreground">
                                        Critical update applied to authentication module
                                    </p>
                                    <Badge variant="secondary" className="mt-2 rounded-md">
                                        auth-patch.log
                                    </Badge>
                                    <p className="text-xs text-muted-foreground mt-2">2 hours ago</p>
                                </div>

                                {/* Suspensions */}
                                <div className="relative">
                                    <span className="absolute -left-[40px] flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary-500 shadow-md">
                                        <AlertTriangle className="w-4 h-4" />
                                    </span>
                                    <h6 className="font-semibold">Account Suspensions</h6>
                                    <p className="text-sm text-muted-foreground">
                                        3 user accounts flagged for suspicious activity
                                    </p>
                                    <Badge variant="secondary" className="mt-2 rounded-md">
                                        suspensions.csv
                                    </Badge>
                                    <p className="text-xs text-muted-foreground mt-2">25 min ago</p>
                                </div>

                            </div>

                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-12 gap-6">

                        <div className="col-span-12 xl:col-span-6">
                            <Card>
                                <CardContent className="p-6">

                                    <h5 className="mb-6 text-lg font-semibold">Connections</h5>

                                    <div className="space-y-5">

                                        {/* Facebook */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-primary-500 border border-border">
                                                <Facebook className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium">Facebook</span>
                                            <Switch className="ml-auto" />
                                        </div>

                                        {/* Twitter */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-primary-500 border border-border">
                                                <Twitter className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium">Twitter</span>
                                            <Switch className="ml-auto" />
                                        </div>

                                        {/* Instagram */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-primary-500 border border-border">
                                                <Instagram className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium">Instagram</span>
                                            <Switch className="ml-auto" />
                                        </div>

                                        {/* LinkedIn */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-primary-500 border border-border">
                                                <Linkedin className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium">LinkedIn</span>
                                            <Switch className="ml-auto" />
                                        </div>

                                        {/* YouTube */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-primary-500 border border-border">
                                                <Youtube className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium">YouTube</span>
                                            <Switch className="ml-auto" />
                                        </div>

                                        {/* TikTok */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-primary-500 border border-border">
                                                <Music className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium">TikTok</span>
                                            <Switch className="ml-auto" />
                                        </div>

                                        {/* Pinterest */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-primary-500 border border-border">
                                                <Pin className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium">Pinterest</span>
                                            <Switch className="ml-auto" />
                                        </div>

                                    </div>

                                <Button variant="link" className="mt-6 px-0">
                                    View all connections
                                </Button>

                            </CardContent>
                        </Card>
                    </div>

                    <div className="col-span-12 xl:col-span-6">
                        <Card>
                            <CardContent className="p-6">

                                <h5 className="mb-6 text-lg font-semibold">Support</h5>

                                <div className="space-y-5">

                                    {/* Data Analysts */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <BarChart3 className="w-5 h-5" />
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="font-semibold">Data Analysts</span>
                                            <span className="text-xs text-muted-foreground">
                                                54 members
                                            </span>
                                        </div>

                                        <Badge className="ml-auto rounded-full bg-primary/10 text-primary">
                                            Analytics
                                        </Badge>
                                    </div>

                                    {/* Cybersecurity */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Shield className="w-5 h-5" />
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="font-semibold">Cybersecurity Team</span>
                                            <span className="text-xs text-muted-foreground">
                                                31 members
                                            </span>
                                        </div>

                                        <Badge variant="secondary" className="ml-auto rounded-full bg-primary/10 text-primary">
                                            Security
                                        </Badge>
                                    </div>

                                    {/* DevOps */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Cloud className="w-5 h-5" />
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="font-semibold">DevOps Engineers</span>
                                            <span className="text-xs text-muted-foreground">
                                                42 members
                                            </span>
                                        </div>

                                        <Badge className="ml-auto rounded-full bg-primary/10 text-primary">
                                            Infrastructure
                                        </Badge>
                                    </div>

                                    {/* Content Writers */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <PenTool className="w-5 h-5" />
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="font-semibold">Content Writers</span>
                                            <span className="text-xs text-muted-foreground">
                                                25 members
                                            </span>
                                        </div>

                                        <Badge className="ml-auto rounded-full bg-primary/10 text-primary">
                                            Content
                                        </Badge>
                                    </div>

                                    {/* Product Managers */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Rocket className="w-5 h-5" />
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="font-semibold">Product Managers</span>
                                            <span className="text-xs text-muted-foreground">
                                                17 members
                                            </span>
                                        </div>

                                        <Badge className="ml-auto rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                                            Strategy
                                        </Badge>
                                    </div>

                                </div>

                                <Button variant="link" className="mt-6 px-0">
                                    View all teams
                                </Button>

                            </CardContent>
                        </Card>
                    </div>

                    </div>


                </div>

             </div>  {/* end grid */}

        </div>
    )
}