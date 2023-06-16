import { HomeIcon } from "@/components/Icons";

export default function Page() {
    return <>
        <div className="flex justify-center ml-5">
            <div className="flex flex-col space-y-4">
                <ol className="relative border-l border-gray-200 dark:border-gray-700 mt-10">
                    <li className="mb-10 ml-4">
                        <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                        <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-200">Aug 2022 - Present · 11 mos</time>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Java Programming Analyst</h3>
                        <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">Equifax Perú · Full-time</p>
                        <a href="#" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-200 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700">Learn more <svg className="w-3 h-3 ml-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></a>
                    </li>
                    <li className="mb-10 ml-4">
                        <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                        <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-200">Aug 2021 - Aug 2022 · 1 yr 1 mo</time>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Centers Junior</h3>
                        <p className="text-base font-normal text-gray-500 dark:text-gray-400">NTT DATA · Full-time</p>
                    </li>
                    <li className="ml-4">
                        <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                        <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-200">Jan 2020 - Jul 2021 · 1 yr 7 mos</time>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Software Developer</h3>
                        <p className="text-base font-normal text-gray-500 dark:text-gray-400">Innova-T · Part-time</p>
                    </li>
                </ol>
            </div>
        </div>
    </>
}