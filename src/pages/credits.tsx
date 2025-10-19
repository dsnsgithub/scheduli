export default function Credits() {
  return (
    <div className="container mx-auto mt-10">
      <div className="shadow-xl flex flex-col items-center justify-center bg-wedgewood-200 border-wedgewood-300 border-2 p-8">
        <h1 className="text-4xl font-bold mb-2">Credits</h1>

        <ul className="mt-10 text-lg">
          <li>
            <a href="https://commons.wikimedia.org/wiki/File:Toicon-icon-avocado-schedule.svg">
              Schedule Icon: Shannon E Thomas/toicon.com
            </a>
            ,{" "}
            <a href="https://creativecommons.org/licenses/by/4.0">CC BY 4.0</a>,
            via Wikimedia Commons
          </li>
        </ul>

        <h3 className="text-lg mt-10"> Created by Dominic Seung</h3>
      </div>
    </div>
  );
}
