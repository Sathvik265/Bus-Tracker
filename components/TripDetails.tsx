import React from 'react';
import { Trip } from '../types';

const LocationPinIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 19l-4.95-6.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);


const TripDetails: React.FC<{ trip: Trip }> = ({ trip }) => {
    return (
        <div className="bg-gray-100/70 rounded-b-xl p-5 border-x-2 border-b-2 border-brand animate-fade-in -mt-2">
            <h4 className="font-bold text-lg mb-4 text-slate-800">Route & Stops</h4>
            <div className="relative pl-3">
                {/* Timeline line */}
                <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-300 rounded"></div>

                {/* Origin */}
                <div className="relative flex items-center mb-4">
                    <div className="z-10 bg-gray-100/70">
                        <div className="h-7 w-7 rounded-full bg-brand ring-4 ring-gray-100/70 flex items-center justify-center text-white font-bold"></div>
                    </div>
                    <p className="ml-5 font-semibold text-slate-700">{trip.route.origin.name}</p>
                </div>

                {/* Stops */}
                {trip.route.stops.map((stop, index) => (
                    <div key={index} className="relative flex items-center mb-4">
                        <div className="z-10 bg-gray-100/70">
                            <div className="h-4 w-4 rounded-full bg-slate-400 ring-4 ring-gray-100/70 ml-[6px]"></div>
                        </div>
                        <p className="ml-[26px] text-slate-600">{stop.name}</p>
                    </div>
                ))}

                {/* Destination */}
                 <div className="relative flex items-center">
                    <div className="z-10 bg-gray-100/70">
                        <div className="h-7 w-7 rounded-full bg-brand ring-4 ring-gray-100/70 flex items-center justify-center text-white">
                             <LocationPinIcon className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="ml-5 font-semibold text-slate-700">{trip.route.destination.name}</p>
                </div>
            </div>
        </div>
    );
};

export default TripDetails;