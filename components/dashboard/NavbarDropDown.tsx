import {
    LogOut,
    Settings,
    User,
} from "lucide-react"
import { Button } from "../ui/button"
import { signOut, useSession } from "next-auth/react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


export default function NavDropdownMenu() {
    const session = useSession()
    const user = session.data?.user;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button >Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72">
                <DropdownMenuLabel>
                    <div className="flex gap-2 px-2 py-1 rounded-md justify-center items-center">
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>{user?.name}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <p className="text-black">{user?.name}</p>
                            <p className="text-black">{user?.email}</p>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
