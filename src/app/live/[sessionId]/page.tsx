import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import LiveSessionClient from "@/components/live/LiveSessionClient";
import { generateJitsiRoomName } from "@/lib/utils";
import { markAttendance } from "@/lib/actions";
import WaitingForTeacher from "@/components/live/WaitingForTeacher";

export default async function LiveSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const session = await auth();
  if (!session || !session.user) redirect("/auth/login");

  const { sessionId } = await params;

  // 1. Fetch Session and Batch Info
  const classSession = await db.queryOne<any>(`
    SELECT cs.*, b.name as batchName, b.teacherId as batchTeacherId, t.userId as teacherUserId
    FROM ClassSession cs
    JOIN Batch b ON cs.batchId = b.id
    JOIN Teacher t ON b.teacherId = t.id
    WHERE cs.id = ?
  `, [sessionId]);

  if (!classSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-slate-950">
        <h2 className="text-2xl font-bold text-white mb-2">Class Session Not Found</h2>
        <p className="text-slate-500">This class may have been cancelled or the link is invalid.</p>
      </div>
    );
  }

  // 2. Identify the role and handle attendance
  const isStudent = (session.user as any).role === "STUDENT";
  
  if (isStudent) {
    const student = await db.queryOne<any>("SELECT id FROM Student WHERE userId = ?", [session.user.id]);
    if (student) {
      // Automark attendance
      await markAttendance(sessionId, student.id);
    }
  }

  const isTeacher = (session.user as any).role === "TEACHER" || (session.user as any).role === "SUPER_ADMIN";
  const isBatchTeacher = classSession.teacherUserId === session.user.id;
  const isHost = isTeacher && (isBatchTeacher || (session.user as any).role === "SUPER_ADMIN");

  // 3. Teacher-First Enforcement: If session is not LIVE, only the host can enter/start it
  if (classSession.status !== 'LIVE' && !isHost) {
    return <WaitingForTeacher />;
  }

  const roomName = generateJitsiRoomName(classSession.batchName, sessionId);

  // Generate Jitsi URL with aggressive security fragment parameters
  const dashboardPath = isHost ? '/teacher/dashboard' : '/student/dashboard';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const exitUrl = encodeURIComponent(`${baseUrl}${dashboardPath}`);

  const config = [
    `config.userInfo.displayName="${encodeURIComponent(session.user.name || 'Anonymous User')}"`,
    `config.prejoinPageEnabled=false`,
    `config.enableWelcomePage=false`, // Avoid redirecting to ffmuc.net homepage after hangup
    `config.enableClosePage=true`,    // Help some browsers/versions close the tab on hangup
    `config.exitUrl="${exitUrl}"`,     // Redirect back to LMS on hangup if the instance allows it
    `config.notificationService.enabled=false`, // Reduce distractions
  ];

  if (!isHost) {
    // ENHANCED SECURITY: Completely hide moderator-capable UI elements for students
    config.push(`config.disableModeratorIndicator=true`);
    config.push(`config.remoteVideoMenu.disableKick=true`);
    config.push(`config.remoteVideoMenu.disableMute=true`);
    config.push(`config.remoteVideoMenu.disableGrantModerator=true`);
    config.push(`config.disableRemoteMute=true`);
    
    // Aggressive UI Hiding
    config.push(`config.participantsPane.enabled=false`); // Hide participants list where they can change roles
    config.push(`config.remoteVideoMenu.disabled=true`); // Disable clicking on others' video menu
    config.push(`config.settingsSections=["devices", "language"]`); // Hide moderator settings
    config.push(`config.viewModeratorModule=false`);
  } else {
    // Moderators start with full capabilities
    config.push(`config.startWithAudioMuted=false`);
    config.push(`config.startWithVideoMuted=false`);
  }

  const roomUrl = `https://meet.ffmuc.net/${roomName}#${config.join('&')}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/50 backdrop-blur-md border-b border-white/5 shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 w-2 h-2 rounded-full animate-pulse" />
          <h1 className="text-white font-bold tracking-tight">Live: {classSession.batchName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{session.user.name}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <LiveSessionClient 
        roomUrl={roomUrl}
        isHost={isHost}
      />

      {/* Footer Info */}
      <div className="px-6 py-3 text-center text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
        StudyCubs Secure Classroom Launchpad · {isHost ? "Host Mode Active" : "Attendee Mode Active"}
      </div>
    </div>
  );
}
