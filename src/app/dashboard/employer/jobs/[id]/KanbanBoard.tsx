"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { updateApplicationStatus } from "@/app/actions/applications";
import { ApplicationStatus } from "@prisma/client";
import { toast } from "sonner";
import { Users, FileText, Calendar, Sparkles, Award, Clock, FileCheck, CheckCircle2 } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CandidateProfile {
  id: string;
  name: string;
  skills: any;
  experience: any;
  education: any;
  resumeUrl: string | null;
}

interface ApplicationItem {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  matchScore: number | null;
  interviewDate?: Date | string | null;
  joiningDate?: Date | string | null;
  noticePeriod?: string | null;
  offerLetterNotes?: string | null;
  createdAt: Date | string;
  candidate: {
    id: string;
    email: string;
    name: string | null;
    candidateProfile: CandidateProfile | null;
  };
}

interface KanbanBoardProps {
  jobTitle: string;
  initialApplications: ApplicationItem[];
}

const COLUMNS: { id: ApplicationStatus; label: string; tone: string }[] = [
  { id: "APPLIED", label: "Applied", tone: "bg-secondary text-foreground" },
  { id: "REVIEWED", label: "Reviewed", tone: "bg-blue-500/10 text-blue-600 border border-blue-500/20" },
  { id: "INTERVIEWED", label: "Interviewed", tone: "bg-amber-500/10 text-amber-600 border border-amber-500/20" },
  { id: "OFFERED", label: "Offered", tone: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" },
];

function KanbanColumn({
  col,
  children,
}: {
  col: { id: ApplicationStatus; label: string; tone: string };
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: col.id,
  });

  return (
    <div
      ref={setNodeRef}
      id={`kanban-col-${col.id}`}
      className={`rounded-2xl border bg-card/60 backdrop-blur-sm p-4 shadow-sm flex flex-col min-h-[500px] transition-all ${
        isOver ? "border-foreground ring-2 ring-foreground/20 bg-accent/10" : "border-border"
      }`}
    >
      {children}
    </div>
  );
}

function KanbanCardItem({
  app,
  children,
}: {
  app: ApplicationItem;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      {children}
    </div>
  );
}

export default function KanbanBoard({ jobTitle, initialApplications }: KanbanBoardProps) {
  const [applications, setApplications] = useState<ApplicationItem[]>(initialApplications);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Interview modal state
  const [interviewApp, setInterviewApp] = useState<ApplicationItem | null>(null);
  const [interviewDateVal, setInterviewDateVal] = useState<string>("");
  const [isScheduling, setIsScheduling] = useState(false);

  // MNC Offer modal state
  const [offerApp, setOfferApp] = useState<ApplicationItem | null>(null);
  const [offerJoiningDate, setOfferJoiningDate] = useState<string>("");
  const [offerNoticePeriod, setOfferNoticePeriod] = useState<string>("15 Days");
  const [offerNotes, setOfferNotes] = useState<string>("Official MNC Employment Offer - Competitive Base Salary + Joining Bonus");
  const [isExtendingOffer, setIsExtendingOffer] = useState(false);

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    const currentApp = applications.find((a) => a.id === appId);
    if (!currentApp) return;

    if (newStatus === "INTERVIEWED") {
      setInterviewApp(currentApp);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      setInterviewDateVal(tomorrow.toISOString().slice(0, 16));
      return;
    }

    if (newStatus === "OFFERED") {
      setOfferApp(currentApp);
      const joining = new Date();
      joining.setDate(joining.getDate() + 15);
      setOfferJoiningDate(joining.toISOString().slice(0, 10));
      return;
    }

    if (currentApp.status === newStatus) return;

    // Optimistic UI update
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );

    setUpdatingId(appId);
    try {
      const res = await updateApplicationStatus(appId, newStatus);
      if (!res.success) {
        setApplications(initialApplications);
        toast.error(res.error || "Failed to update status");
      } else {
        toast.success(`Moved application to ${newStatus}`);
      }
    } catch (err) {
      console.error(err);
      setApplications(initialApplications);
      toast.error("Failed to update application status");
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmInterviewSchedule = async () => {
    if (!interviewApp || !interviewDateVal) {
      toast.error("Please pick a date and time for the interview.");
      return;
    }

    setIsScheduling(true);
    setUpdatingId(interviewApp.id);

    try {
      const res = await updateApplicationStatus(
        interviewApp.id,
        "INTERVIEWED",
        interviewDateVal
      );

      if (res.success) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === interviewApp.id
              ? { ...app, status: "INTERVIEWED", interviewDate: interviewDateVal }
              : app
          )
        );

        toast.success("Interview scheduled & email notification sent!");

        if (res.calendarEventLink) {
          toast("Google Calendar Link Created", {
            action: {
              label: "Open Event",
              onClick: () => window.open(res.calendarEventLink!, "_blank"),
            },
          });
        }
        setInterviewApp(null);
      } else {
        toast.error(res.error || "Failed to schedule interview.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while scheduling the interview.");
    } finally {
      setIsScheduling(false);
      setUpdatingId(null);
    }
  };

  const confirmExtendOffer = async () => {
    if (!offerApp || !offerJoiningDate) {
      toast.error("Please select an estimated joining date for the offer.");
      return;
    }

    setIsExtendingOffer(true);
    setUpdatingId(offerApp.id);

    try {
      const res = await updateApplicationStatus(
        offerApp.id,
        "OFFERED",
        undefined,
        {
          joiningDate: offerJoiningDate,
          noticePeriod: offerNoticePeriod,
          offerLetterNotes: offerNotes,
        }
      );

      if (res.success) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === offerApp.id
              ? {
                  ...app,
                  status: "OFFERED",
                  joiningDate: offerJoiningDate,
                  noticePeriod: offerNoticePeriod,
                  offerLetterNotes: offerNotes,
                }
              : app
          )
        );

        toast.success("🎉 Official MNC Offer Letter Extended to candidate!");
        setOfferApp(null);
      } else {
        toast.error(res.error || "Failed to extend offer letter.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while extending offer letter.");
    } finally {
      setIsExtendingOffer(false);
      setUpdatingId(null);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDndKitDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDndKitDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const appId = active.id as string;
    const overId = over.id as string;

    // Check if over target is a column status or card
    let targetStatus: ApplicationStatus | null = null;
    if (COLUMNS.some((c) => c.id === overId)) {
      targetStatus = overId as ApplicationStatus;
    } else {
      const overApp = applications.find((a) => a.id === overId);
      if (overApp) {
        targetStatus = overApp.status;
      }
    }

    if (targetStatus) {
      handleStatusChange(appId, targetStatus);
    }
  };

  const activeApp = activeId ? applications.find((a) => a.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDndKitDragStart}
      onDragEnd={handleDndKitDragEnd}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-match-glow">
          <div>
            <h2 className="font-serif text-2xl font-normal text-foreground">
              Pipeline Roster: {jobTitle}
            </h2>
            <p className="text-xs text-muted-foreground mt-1 font-sans">
              Drag cards across columns or use the quick status dropdown on each candidate card.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 text-xs font-semibold text-foreground">
              <Users className="h-3.5 w-3.5" />
              {applications.length} Total Applicant{applications.length !== 1 && "s"}
            </span>
          </div>
        </div>

        {/* Columns Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((col) => {
            const colApps = applications.filter((a) => a.status === col.id);

            return (
              <KanbanColumn key={col.id} col={col}>
                {/* Column Header */}
                <div className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold ${col.tone}`}>
                  <span>{col.label}</span>
                  <span className="tabular-nums font-mono px-2 py-0.5 rounded-full bg-background/80 text-foreground">
                    {colApps.length}
                  </span>
                </div>

                {/* Cards Roster */}
                <div className="mt-4 space-y-3 flex-1 overflow-y-auto pr-0.5">
                  <SortableContext
                    items={colApps.map((a) => a.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <AnimatePresence mode="popLayout">
                      {colApps.length === 0 ? (
                        <div className="h-32 rounded-xl border border-dashed border-border/60 flex items-center justify-center text-xs text-muted-foreground italic select-none">
                          No candidates in {col.label}
                        </div>
                      ) : (
                        colApps.map((app) => {
                          const profile = app.candidate.candidateProfile;
                          const candidateName = profile?.name || app.candidate.name || app.candidate.email.split("@")[0];
                          const matchScore = app.matchScore !== null ? Math.round(app.matchScore) : null;
                          const skills = profile && Array.isArray(profile.skills) ? (profile.skills as string[]) : [];

                          return (
                            <KanbanCardItem key={app.id} app={app}>
                              <motion.div
                                layout
                                className={`group relative rounded-xl border border-border bg-background p-4 text-xs shadow-xs hover:border-foreground/40 transition-all cursor-grab active:cursor-grabbing select-none ${
                                  updatingId === app.id ? "opacity-50 pointer-events-none" : ""
                                }`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h4 className="font-semibold text-foreground text-sm font-sans">
                                      {candidateName}
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground font-mono truncate max-w-[150px]">
                                      {app.candidate.email}
                                    </p>
                                  </div>
                                  {matchScore !== null ? (
                                    <span className="rounded-full bg-[oklch(0.88_0.22_130)] text-[#182025] font-mono text-[11px] font-bold px-2.5 py-0.5 shrink-0">
                                      {matchScore}%
                                    </span>
                                  ) : (
                                    <span className="rounded-full bg-secondary text-muted-foreground font-mono text-[10px] px-2 py-0.5 shrink-0">
                                      N/A
                                    </span>
                                  )}
                                </div>

                                {skills.length > 0 && (
                                  <div className="mt-2.5 flex flex-wrap gap-1">
                                    {skills.slice(0, 3).map((skill) => (
                                      <span
                                        key={skill}
                                        className="rounded-full bg-secondary/80 px-2 py-0.5 text-[10px] text-muted-foreground font-medium"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                    {skills.length > 3 && (
                                      <span className="text-[10px] text-muted-foreground self-center">
                                        +{skills.length - 3}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* INTERVIEWED status box */}
                                {app.status === "INTERVIEWED" && app.interviewDate && (
                                  <div className="mt-3 flex items-center justify-between gap-1 text-[11px] text-amber-600 font-mono bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                                    <span className="flex items-center gap-1.5">
                                      <Calendar className="h-3.5 w-3.5" />
                                      {new Date(app.interviewDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                    </span>
                                    <button
                                      type="button"
                                      onPointerDown={(e) => e.stopPropagation()}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusChange(app.id, "INTERVIEWED");
                                      }}
                                      className="hover:underline font-bold cursor-pointer text-[10px]"
                                    >
                                      Reschedule
                                    </button>
                                  </div>
                                )}

                                {/* OFFERED status box */}
                                {app.status === "OFFERED" && (
                                  <div className="mt-3 space-y-1.5 text-[11px] bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-sans">
                                    <div className="flex items-center justify-between font-bold font-mono">
                                      <span className="flex items-center gap-1">
                                        <Award className="h-3.5 w-3.5" /> MNC Offer Extended
                                      </span>
                                      <button
                                        type="button"
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStatusChange(app.id, "OFFERED");
                                        }}
                                        className="hover:underline text-[10px] cursor-pointer"
                                      >
                                        Edit Offer
                                      </button>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between text-[10.5px] font-mono text-muted-foreground pt-1 border-t border-emerald-500/20">
                                      <span>Joining: <strong>{app.joiningDate ? new Date(app.joiningDate).toLocaleDateString() : "TBD"}</strong></span>
                                      <span>Notice: <strong>{app.noticePeriod || "15 Days"}</strong></span>
                                    </div>
                                  </div>
                                )}

                                {/* Quick Status Dropdown & Details Dialog */}
                                <div className="mt-3.5 flex items-center justify-between border-t border-border/40 pt-2.5 gap-2">
                                  <select
                                    value={app.status}
                                    onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-secondary/60 text-foreground font-mono text-[10px] rounded-lg px-2 py-1 border border-border/60 focus:outline-none cursor-pointer"
                                  >
                                    {COLUMNS.map((c) => (
                                      <option key={c.id} value={c.id}>
                                        {c.label}
                                      </option>
                                    ))}
                                  </select>

                                  <Dialog>
                                    <DialogTrigger
                                      render={
                                        <Button
                                          variant="ghost"
                                          size="xs"
                                          onPointerDown={(e) => e.stopPropagation()}
                                          onClick={(e) => e.stopPropagation()}
                                          className="text-[10px] text-muted-foreground hover:text-foreground font-mono cursor-pointer"
                                        />
                                      }
                                    >
                                      View Profile
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-lg p-6 bg-card border border-border rounded-2xl shadow-match-glow">
                                      <DialogHeader>
                                        <DialogTitle className="font-serif text-xl font-normal text-foreground">
                                          {candidateName}
                                        </DialogTitle>
                                        <DialogDescription className="text-xs text-muted-foreground">
                                          {app.candidate.email}
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4 text-xs mt-2">
                                        <div>
                                          <span className="font-mono font-bold uppercase text-muted-foreground">Current Status:</span>
                                          <span className="ml-2 font-bold text-foreground">{app.status}</span>
                                        </div>
                                        <div>
                                          <span className="font-mono font-bold uppercase text-muted-foreground">Match Score:</span>
                                          <span className="ml-2 font-bold text-foreground">{matchScore !== null ? `${matchScore}%` : "N/A"}</span>
                                        </div>
                                        {profile?.resumeUrl && (
                                          <div>
                                            <span className="font-mono font-bold uppercase text-muted-foreground">Resume:</span>
                                            <p className="mt-1 font-mono text-muted-foreground flex items-center gap-1.5">
                                              <FileText className="h-4 w-4 text-foreground" /> {profile.resumeUrl}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex justify-end pt-4">
                                        <DialogClose render={<Button variant="outline" size="sm" className="rounded-full cursor-pointer text-xs" />}>
                                          Close
                                        </DialogClose>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </motion.div>
                            </KanbanCardItem>
                          );
                        })
                      )}
                    </AnimatePresence>
                  </SortableContext>
                </div>
              </KanbanColumn>
            );
          })}
        </div>

        {/* Drag Overlay for Floating Drag Preview */}
        <DragOverlay>
          {activeApp ? (
            <div className="rounded-xl border-2 border-foreground bg-background p-4 text-xs shadow-2xl opacity-90 scale-105">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-foreground text-sm font-sans">
                    {activeApp.candidate.candidateProfile?.name || activeApp.candidate.name || activeApp.candidate.email.split("@")[0]}
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {activeApp.candidate.email}
                  </p>
                </div>
                {activeApp.matchScore !== null && (
                  <span className="rounded-full bg-[oklch(0.88_0.22_130)] text-[#182025] font-mono text-[11px] font-bold px-2.5 py-0.5">
                    {Math.round(activeApp.matchScore)}%
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </DragOverlay>

        {/* Google Calendar Interview Schedule Modal */}
        <Dialog open={!!interviewApp} onOpenChange={(open) => !open && setInterviewApp(null)}>
          <DialogContent className="sm:max-w-md p-6 bg-card border border-border rounded-2xl shadow-match-glow">
            <DialogHeader>
              <div className="flex items-center gap-2 text-amber-500 font-mono text-xs uppercase font-bold mb-1">
                <Calendar className="h-4 w-4" /> Google Calendar Scheduling
              </div>
              <DialogTitle className="font-serif text-2xl font-normal text-foreground">
                Schedule Interview
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Pick a date and time to interview{" "}
                <strong>
                  {interviewApp?.candidate.candidateProfile?.name ||
                    interviewApp?.candidate.email}
                </strong>
                . This will save the slot, email the candidate, and generate a Google Calendar invite.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="space-y-1.5">
                <label htmlFor="interview-date" className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-foreground" /> Date & Time (Local)
                </label>
                <input
                  id="interview-date"
                  type="datetime-local"
                  value={interviewDateVal}
                  onChange={(e) => setInterviewDateVal(e.target.value)}
                  className="w-full h-11 px-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground focus:outline-none focus:border-foreground"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInterviewApp(null)}
                className="rounded-full cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isScheduling}
                onClick={confirmInterviewSchedule}
                className="rounded-full bg-foreground text-background font-bold cursor-pointer text-xs px-5 hover:bg-accent hover:text-black"
              >
                {isScheduling ? "Scheduling..." : "Schedule & Invite"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Official MNC Offer Letter Modal */}
        <Dialog open={!!offerApp} onOpenChange={(open) => !open && setOfferApp(null)}>
          <DialogContent className="sm:max-w-md p-6 bg-card border border-border rounded-2xl shadow-match-glow">
            <DialogHeader>
              <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs uppercase font-bold mb-1">
                <Award className="h-4 w-4" /> Official MNC Offer Letter
              </div>
              <DialogTitle className="font-serif text-2xl font-normal text-foreground">
                Extend Employment Offer
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Configure joining date, notice period, and offer terms for{" "}
                <strong>
                  {offerApp?.candidate.candidateProfile?.name || offerApp?.candidate.email}
                </strong>
                .
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="space-y-1.5">
                <label htmlFor="joining-date" className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Estimated Joining Date
                </label>
                <input
                  id="joining-date"
                  type="date"
                  value={offerJoiningDate}
                  onChange={(e) => setOfferJoiningDate(e.target.value)}
                  className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="notice-period" className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Notice Period Requirement
                </label>
                <select
                  id="notice-period"
                  value={offerNoticePeriod}
                  onChange={(e) => setOfferNoticePeriod(e.target.value)}
                  className="w-full h-10 px-3 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-none focus:border-foreground"
                >
                  <option value="Immediate">Immediate Joining</option>
                  <option value="15 Days">15 Days Notice Period</option>
                  <option value="30 Days">30 Days Notice Period</option>
                  <option value="60 Days">60 Days Notice Period</option>
                  <option value="90 Days">90 Days Notice Period</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="offer-notes" className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Offer Terms & Compensation Notes
                </label>
                <textarea
                  id="offer-notes"
                  rows={3}
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  className="w-full p-3 bg-background border border-border rounded-xl text-xs font-sans text-foreground focus:outline-none focus:border-foreground"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOfferApp(null)}
                className="rounded-full cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isExtendingOffer}
                onClick={confirmExtendOffer}
                className="rounded-full bg-emerald-600 text-white font-bold cursor-pointer text-xs px-5 hover:bg-emerald-500"
              >
                {isExtendingOffer ? "Extending Offer..." : "Send Official Offer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DndContext>
  );
}
