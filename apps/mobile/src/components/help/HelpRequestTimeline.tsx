'use client';

import React from 'react';
import { CheckCircle2, Circle, Clock, User, AlertCircle } from 'lucide-react';

interface HelpRequestEvent {
  id: string;
  previousStatus: string | null;
  nextStatus: string;
  note: string | null;
  createdAt: string;
}

interface HelpRequestTimelineProps {
  events: HelpRequestEvent[];
  currentStatus: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  OPEN: { label: 'Request Opened', color: 'text-wira-teal', icon: AlertCircle },
  CLAIMED: { label: 'Volunteer Claimed', color: 'text-wira-gold', icon: User },
  IN_PROGRESS: { label: 'Help On Site', color: 'text-wira-gold', icon: Clock },
  RESOLVED: { label: 'Resolved', color: 'text-status-safe', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', color: 'text-wira-earth/40', icon: Circle },
};

export default function HelpRequestTimeline({ events, currentStatus }: HelpRequestTimelineProps) {
  // Sort events by date descending
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h4 className="text-xs font-display font-bold uppercase tracking-widest text-wira-earth/60">Status Timeline</h4>
         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            currentStatus === 'RESOLVED' ? 'bg-status-safe/10 text-status-safe border-status-safe/20' :
            currentStatus === 'OPEN' ? 'bg-wira-teal/10 text-wira-teal border-wira-teal/20' :
            'bg-wira-gold/10 text-wira-gold border-wira-gold/20'
         }`}>
            {currentStatus}
         </span>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-wira-ivory-dark before:to-transparent">
        {sortedEvents.length > 0 ? (
          sortedEvents.map((event, index) => {
            const config = STATUS_CONFIG[event.nextStatus] || STATUS_CONFIG.OPEN;
            const Icon = config.icon;

            return (
              <div key={event.id} className="relative flex items-start gap-6 group animate-fade-in">
                <div className={`absolute left-0 mt-0.5 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-sm transition-all ${
                    index === 0 ? 'bg-white ring-2 ring-wira-teal/20 scale-110' : 'bg-wira-ivory-dark group-hover:bg-white'
                }`}>
                  <Icon size={16} className={index === 0 ? config.color : 'text-wira-earth/30'} />
                </div>
                <div className="flex-1 pt-0.5 pl-10">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className={`text-sm font-display font-bold ${index === 0 ? 'text-wira-earth' : 'text-wira-earth/60'}`}>
                      {config.label}
                    </p>
                    <time className="text-[10px] font-body text-wira-earth/40 whitespace-nowrap">
                      {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>
                  {event.note && (
                    <p className="text-xs font-body text-wira-earth/50 leading-relaxed italic">
                      "{event.note}"
                    </p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="relative flex items-start gap-6">
             <div className="absolute left-0 mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-white border-4 border-wira-ivory-dark text-wira-teal">
                <AlertCircle size={16} />
             </div>
             <div className="flex-1 pt-2.5 pl-10">
                <p className="text-sm font-display font-bold text-wira-earth">Request Submitted</p>
                <p className="text-xs font-body text-wira-earth/40">Waiting for volunteer assignment...</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
