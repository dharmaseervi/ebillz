"use client"
import * as React from "react"

import { useSession } from "next-auth/react"
import NavDropdownMenu from "./NavbarDropDown"



const components: { title: string; href: string; description: string }[] = [
    {
        title: "Alert Dialog",
        href: "/docs/primitives/alert-dialog",
        description:
            "A modal dialog that interrupts the user with important content and expects a response.",
    },
    {
        title: "Hover Card",
        href: "/docs/primitives/hover-card",
        description:
            "For sighted users to preview content available behind a link.",
    },
    {
        title: "Progress",
        href: "/docs/primitives/progress",
        description:
            "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
    },
    {
        title: "Scroll-area",
        href: "/docs/primitives/scroll-area",
        description: "Visually or semantically separates content.",
    },
    {
        title: "Tabs",
        href: "/docs/primitives/tabs",
        description:
            "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
    },
    {
        title: "Tooltip",
        href: "/docs/primitives/tooltip",
        description:
            "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
    },
]

export default function Navbar() {
    const session = useSession()
    const user = session.data?.user;
    return (
        <div className="flex justify-between bg-gray-700 py-5 px-5">
            <div className="flex justify-center items-center ">
                <h1 className="text-2xl font-bold text-white-100">
                    Dashboard
                </h1>
            </div>
            <div className="">
                <NavDropdownMenu />
            </div>
        </div>
    )
}
