import Link from 'next/link';

export default function HomePage() {
  return (
    
    <div className="p-8">
      
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        MeetRiders
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Available Rides</h2>
        
        <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">
            No rides are available at the moment.
          </p>
          
          {/* 3. Rose-colored button */}
          <Link 
            href="/hostparty"
            className="px-6 py-2 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-colors duration-300 shadow"
          >
            Host a Ride
          </Link>
        </div>
      </div>

    </div>
  );
}