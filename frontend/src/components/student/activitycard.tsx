/** @format */

"use client";

export function ActivityCard({ activity, onSelect }: any) {
  return (
    <button
      onClick={onSelect}
      className={`bg-gradient-to-br ${activity.color} rounded-xl p-8 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer min-h-56 flex flex-col justify-center items-center group`}
    >
      <div className="text-7xl mb-6 group-hover:scale-125 transition-transform duration-300">
        {activity.icon}
      </div>

      <h3 className="text-2xl font-bold mb-3 text-center">{activity.title}</h3>
      <p className="text-white text-opacity-90 font-medium text-center text-sm">
        {activity.description}
      </p>
    </button>
  );
}
