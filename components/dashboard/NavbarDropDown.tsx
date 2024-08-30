import {
    LogOut,
    Settings,
    User,
} from "lucide-react"
import {
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton
  } from '@clerk/nextjs'


export default function NavDropdownMenu() {
    // const session = useSession()
    // const user = session.data?.user;
    return (
        <div>
            <SignedOut>
                <SignInButton />
            </SignedOut>
            <SignedIn>
                <UserButton showName />
            </SignedIn>
        </div>
    )
}
