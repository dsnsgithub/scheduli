export default function Feedback() {
  return (
    <div className="container mx-auto mt-10">
      <div className="shadow-xl flex flex-col items-center bg-wedgewood-200 border-wedgewood-300 border-2 p-8">
        <h1 className="text-4xl font-bold mb-8">Feedback - Request Schedule</h1>

        <h3>
          Have feedback? Send feedback to{" "}
          <a href="mailto:scheduli@dsns.dev" className="text-blue-800 hover:underline">
            scheduli@dsns.dev
          </a>
          .
        </h3>
      </div>
    </div>
  );
}
