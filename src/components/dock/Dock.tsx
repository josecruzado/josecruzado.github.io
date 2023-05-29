"use client"
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { DockContextType } from '../../../types'
import { CameraIcon, DevelopmentIcon, GitHubIcon, HomeIcon, LinkedinIcon } from '../Icons'
import { MouseProvider } from '../context/MouseProvider'
import DockItem from './DockItem'
import Link from 'next/link'

/**
 * <DockContext> provider.
 * @param hovered - If is hovering <nav> element.
 * @param width - The width of <nav> element.
 */
const DockContext = createContext<DockContextType | null>(null)

export const useDock = () => {
  return useContext(DockContext)
}

const Dock = () => {
  const ref = useRef<HTMLElement>(null)
  const [hovered, setHovered] = useState(false)
  const [width, setWidth] = useState<number | undefined>()

  useEffect(() => {
    setWidth(ref?.current?.clientWidth)
  }, [])

  return (
    <MouseProvider>
      <footer className="fixed inset-x-0 bottom-6 z-40 flex w-full justify-center">
        <DockContext.Provider value={{ hovered, width }}>
          <nav
            ref={ref}
            className="bg-grid flex justify-center rounded-md p-3"
            onMouseOver={() => setHovered(true)}
            onMouseOut={() => setHovered(false)}
          >
            <ul className="flex h-10 items-end justify-center space-x-3">
              <DockItem>
                <Link
                  className="relative flex h-full w-full items-center justify-center"
                  aria-label="Star this project on GitHub"
                  href="/about"
                  rel="external nofollow noopener noreferrer"
                >
                  <HomeIcon className="relative h-3/5 w-3/5" aria-hidden="true" />
                </Link>
              </DockItem>
              <DockItem>
                <a
                  className="relative flex h-full w-full items-center justify-center"
                  aria-label="Star this project on GitHub"
                  href="https://github.com/josecruzado"
                  rel="external nofollow noopener noreferrer"
                  target="_blank"
                >
                  <DevelopmentIcon className="relative h-3/5 w-3/5" aria-hidden="true" />
                </a>
              </DockItem>
              <DockItem>
                <a
                  className="relative flex h-full w-full items-center justify-center"
                  aria-label="Star this project on GitHub"
                  href="https://github.com/josecruzado"
                  rel="external nofollow noopener noreferrer"
                  target="_blank"
                >
                  <CameraIcon className="relative h-3/5 w-3/5" aria-hidden="true" />
                </a>
              </DockItem>
              <li className="self-center" aria-hidden="true">
                <hr className="!mx-2 block h-12 w-px border-none bg-[hsl(0,0%,78%)]" />
              </li>
              <DockItem>
                <a
                  className="relative flex h-full w-full items-center justify-center"
                  aria-label="Star this project on GitHub"
                  href="https://github.com/josecruzado"
                  rel="external nofollow noopener noreferrer"
                  target="_blank"
                >
                  <GitHubIcon className="relative h-3/5 w-3/5" aria-hidden="true" />
                </a>
              </DockItem>
              <DockItem>
                <a
                  className="relative flex h-full w-full items-center justify-center"
                  aria-label="View me on Twitter"
                  href="https://www.linkedin.com/in/josecruzado12/"
                  rel="external nofollow noopener noreferrer"
                  target="_blank"
                >
                  <LinkedinIcon className="relative h-3/5 w-3/5" aria-hidden="true" />
                </a>
              </DockItem>
            </ul>
          </nav>
        </DockContext.Provider>
      </footer>
    </MouseProvider>
  )
}

export default Dock
