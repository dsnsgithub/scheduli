import Link from "next/link";
import React from "react";
import Image from "next/image";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faCalendarDays, faCircleInfo, faComment, faHome, faTimes, faBars } from "@fortawesome/free-solid-svg-icons";
import { faCreativeCommonsBy } from "@fortawesome/free-brands-svg-icons";

import ScheduleIcon from "./ScheduleIcon";

export default function Navbar() {
	const [currentDate, setCurrentDate] = React.useState(new Date());
	const [isLoading, setIsLoading] = React.useState(true);

	const [isOpen, setIsOpen] = React.useState(false);

	const toggleMenu = () => {
		setIsOpen(!isOpen);
	};

	React.useEffect(() => {
		setCurrentDate(new Date());
		setIsLoading(false);

		const interval = setInterval(() => {
			setCurrentDate(new Date());
			setIsLoading(false);
		}, 1000); // Update every second, or adjust as needed

		// Clean up the interval when the component unmounts
		return () => clearInterval(interval);
	}, []);

	return (
		<nav className="flex justify-around items-center mt-8 py-4 px-4">
			<Link className="flex items-center" href="/">
				{isLoading ? <></> : <Image src={ScheduleIcon(currentDate.getDate())} alt="Scheduli Icon" width="80" quality={100} />}
				<h1 className="px-4 text-4xl font-bold hidden lg:inline">Scheduli</h1>
			</Link>

			<div className="hidden lg:flex">
				<Link className="px-2 md:px-5 lg:px-6" href="/">
					<FontAwesomeIcon icon={faHome} size="xl" />
				</Link>
				<Link className="px-2 md:px-5 lg:px-6" href="/about">
					<FontAwesomeIcon icon={faCircleInfo} size="xl" />
				</Link>
				<Link className="px-2 md:px-5 lg:px-6" href="/create">
					<FontAwesomeIcon icon={faCalendarDays} size="xl" />
				</Link>
				<Link className="px-2 md:px-5 lg:px-6" href="/credits">
					<FontAwesomeIcon icon={faCreativeCommonsBy} size="xl" />
				</Link>
				<Link className="px-2 md:px-5 lg:px-6" href="/feedback">
					<FontAwesomeIcon icon={faComment} size="xl" />
				</Link>
				<Link className="px-2 md:px-5 lg:px-6" href="/privacy">
					<FontAwesomeIcon icon={faBook} size="xl" />
				</Link>
			</div>

			{/* Hamburger menu button for small screens */}
			<div className="lg:hidden">
				<button onClick={toggleMenu} className="p-2 focus:outline-none">
					{isOpen ? (
						<FontAwesomeIcon icon={faTimes} size="2x" className="text-wedgewood-600 border border-wedgewood-600 p-2 rounded-lg" />
					) : (
						<FontAwesomeIcon icon={faBars} size="2x" className="" />
					)}
				</button>
			</div>

			{/* Mobile menu */}
			{isOpen && (
				<div className="lg:hidden absolute top-0 right-0 mt-16 w-full bg-wedgewood-100 shadow-md p-4 rounded-lg border border-wedgewood-600">
					<div className="flex flex-row-reverse mb-4">
						<button onClick={toggleMenu} className="focus:outline-none text-wedgewood-600 border border-wedgewood-600 rounded-full w-10 h-10 flex items-center justify-center">
							<FontAwesomeIcon icon={faTimes} size="lg" />
						</button>
					</div>
					<div className="flex flex-col items-center">
						<Link className="p-4 border-wedgewood-300 bg-wedgewood-200 border-2 rounded w-full text-center m-2 font-bold" href="/">
							<FontAwesomeIcon icon={faHome} className="mr-2" />
							Home
						</Link>
						<Link className="p-4 border-wedgewood-300 bg-wedgewood-200 border-2 rounded w-full text-center m-2 font-bold" href="/about">
							<FontAwesomeIcon icon={faCircleInfo} className="mr-2" />
							About
						</Link>
						<Link className="p-4 border-wedgewood-300 bg-wedgewood-200 border-2 rounded w-full text-center m-2 font-bold" href="/create">
							<FontAwesomeIcon icon={faCalendarDays} className="mr-2" />
							Create
						</Link>
						<Link className="p-4 border-wedgewood-300 bg-wedgewood-200 border-2 rounded w-full text-center m-2 font-bold" href="/credits">
							<FontAwesomeIcon icon={faCreativeCommonsBy} className="mr-2" />
							Credits
						</Link>
						<Link className="p-4 border-wedgewood-300 bg-wedgewood-200 border-2 rounded w-full text-center m-2 font-bold" href="/feedback">
							<FontAwesomeIcon icon={faComment} className="mr-2" />
							Feedback
						</Link>
						<Link className="p-4 border-wedgewood-300 bg-wedgewood-200 border-2 rounded w-full text-center m-2 font-bold" href="/privacy">
							<FontAwesomeIcon icon={faBook} className="mr-2" />
							Privacy
						</Link>
					</div>
				</div>
			)}
		</nav>
	);
}
