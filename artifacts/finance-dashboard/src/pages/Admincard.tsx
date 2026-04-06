export default function AdminCard() {
  return (
    <div className="flex items-center justify-center h-screen ">
      <div className="bg-white p-6 rounded-2xl shadow-md w-[350px] text-center">
        <h2 className="text-xl font-semibold mb-2">Admin Access</h2>

        <p className="text-gray-600 text-sm mb-4">
          The following admin credentials are shared strictly for testing and demonstration purposes.
        </p>

        <div className="bg-gray-100 p-3 rounded-lg mb-4">
          <p><span className="font-medium">Email:</span> admin@example.com</p>
          <p><span className="font-medium">Password:</span> admin123</p>
        </div>

        
      </div>
    </div>
  );
}