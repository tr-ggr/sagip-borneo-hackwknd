'use client';

import React, { useState } from 'react';
import { LifeBuoy, HandHeart, AlertCircle, HelpCircle } from 'lucide-react';
import { useVolunteersControllerApply, useVolunteersControllerGetStatus } from '@wira-borneo/api-client';

export default function HelpDashboard() {
  const [activeTab, setActiveTab] = useState<'request' | 'volunteer'>('request');
  const { data: volunteerStatus } = useVolunteersControllerGetStatus();

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold wira-card-title">Help Center</h1>
            <HelpCircle size={20} className="text-wira-gold" />
          </div>
          
          <div className="flex bg-wira-ivory-dark rounded-xl p-1">
            <button 
              onClick={() => setActiveTab('request')}
              className={`flex-1 py-2 text-xs font-body font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'request' ? 'bg-white text-wira-teal shadow-sm' : 'text-wira-earth/50'}`}
            >
              Request Help
            </button>
            <button 
              onClick={() => setActiveTab('volunteer')}
              className={`flex-1 py-2 text-xs font-body font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'volunteer' ? 'bg-white text-wira-teal shadow-sm' : 'text-wira-earth/50'}`}
            >
              Volunteer
            </button>
          </div>
      </header>

      {activeTab === 'request' ? (
        <div className="space-y-6 animate-slide-up">
           <div className="wira-card p-6 border-status-critical/20 bg-status-critical/5 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-status-critical/10 flex items-center justify-center">
                <AlertCircle className="text-status-critical w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-display font-bold wira-card-title">Send Emergency Signal</h3>
                <p className="text-xs font-body wira-card-body">
                    Use this only if you require immediate assistance. Your location will be sent to authorities and nearby volunteers.
                </p>
              </div>
              <button className="wira-btn-emergency">
                Request Help NOW
              </button>
           </div>


        </div>
      ) : (
        <div className="space-y-6 animate-slide-up">
           <div className="wira-card p-6 border-wira-teal/20 bg-wira-teal/5 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-wira-teal/10 flex items-center justify-center">
                <HandHeart className="text-wira-teal w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-display font-bold wira-card-title">Become a WIRA Volunteer</h3>
                <p className="text-xs font-body wira-card-body">
                    Only registered volunteers can respond to emergency signals. Help your community build resilience.
                </p>
              </div>
              <button className="wira-btn-primary">
                Register as Volunteer
              </button>
           </div>

           <div className="wira-card bg-wira-earth text-white border-none p-5 space-y-3">
              <div className="flex items-center gap-2">
                 <LifeBuoy size={16} className="text-wira-gold" />
                 <h4 className="text-xs font-display font-bold uppercase tracking-widest text-wira-ivory-dark">Safety Guidelines</h4>
              </div>
              <p className="text-[11px] font-body text-white/70 leading-relaxed italic">
                "Personal safety is the first priority before helping others."
              </p>
           </div>
        </div>
      )}
    </div>
  );
}
