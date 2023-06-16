import Image from 'next/image'
export default function Page() {
    return <>
        <div className="flex items-center justify-center h-screen bg-gradient-to-br">
            <div className="bg-white font-semibold text-center rounded-3xl border shadow-lg p-10 max-w-xs">
                <img className="mb-3 w-32 h-32 rounded-full shadow-lg mx-auto" src="https://media.licdn.com/dms/image/C4D03AQEz056KuAkI4Q/profile-displayphoto-shrink_200_200/0/1627846133271?e=1691020800&v=beta&t=z6iyjg8GbLhddIUcsLOq8twKm3mKDK9prkd7dOccbJE" alt="product designer"></img>
                    <h1 className="text-lg text-gray-700"> Jose Cruzado </h1>
                    <h3 className="text-sm text-gray-400 "> Software developer </h3>
                    <p className="text-xs text-gray-400 mt-3 mb-5"> I am a person who strives to achieve what I set out to do and passionate about technology. I have experience as a Full-Stack developer with more backend leaning. I have developed systems using Angular and SpringMVC frameworks.</p>
                    <a className="button bg-gray-200 dark:bg-gray-800 hover:bg-gray-400 px-8 py-2 mt-8 rounded-3xl shadow text-gray-800 dark:text-gray-100 font-semibold uppercase tracking-wide" href='https://www.linkedin.com/in/josecruzado12/'>Contact me</a>
            </div>
        </div>
    </>
}