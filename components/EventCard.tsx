
import React from 'react';
import { Event, Club } from '../types';
import { Calendar, Tag, CreditCard, ChevronRight, Heart } from 'lucide-react';

interface EventCardProps {
  event: Event;
  club?: Club;
  onViewDetails?: (id: string) => void;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, club, onViewDetails, isSaved, onToggleSave }) => {
  return (
    <div className="bg-white dark:bg-[#111C44] rounded-[20px] overflow-hidden mits-shadow hover:shadow-lg transition-all group relative p-5">
      
      {/* Image / Header Area */}
      <div className="h-32 w-full rounded-[15px] bg-gradient-to-r from-blue-400 to-indigo-500 relative mb-4 overflow-hidden cursor-pointer" onClick={() => onViewDetails?.(event.id)}>
        {event.bannerUrl && <img src={event.bannerUrl} alt="" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />}
        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md p-1.5 rounded-full cursor-pointer hover:bg-white/40 transition-colors z-10"
             onClick={(e) => { e.stopPropagation(); onToggleSave?.(event.id); }}>
            <Heart size={16} className={isSaved ? "fill-white text-white" : "text-white"} />
        </div>
        <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-[#111C44]/90 px-2 py-1 rounded-[8px] text-[10px] font-bold text-[#2B3674] dark:text-white flex items-center gap-1">
            <Calendar size={10} /> {event.date}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-start mb-2">
            <h3 
              className="text-lg font-bold text-[#2B3674] dark:text-white leading-tight line-clamp-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => onViewDetails?.(event.id)}
            >
              {event.title}
            </h3>
        </div>
        <p className="text-xs text-[#A3AED0] mb-4 font-medium">{club?.name || 'MITS Club'}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             {event.type === 'Paid' ? (
                 <span className="text-[#4318FF] bg-[#F4F7FE] px-2 py-1 rounded-md text-xs font-bold">₹{event.fee}</span>
             ) : (
                 <span className="text-[#05CD99] bg-[#E6FDF9] px-2 py-1 rounded-md text-xs font-bold">Free</span>
             )}
          </div>
          
          <button 
            onClick={() => onViewDetails?.(event.id)}
            className="bg-[#2B3674] dark:bg-[#4318FF] text-white px-4 py-2 rounded-[10px] text-xs font-bold hover:opacity-90 transition-opacity"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
