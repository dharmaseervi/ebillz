'use client'
import {
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton
} from '@clerk/nextjs';

import { useUser } from '@clerk/nextjs'


export default function NavDropdownMenu() {
    const { isLoaded, isSignedIn, user } = useUser()

    if (!isLoaded || !isSignedIn) {
        return null
    }
    console.log(user);


    return (
        <div className="relative">
            <SignedOut>
                <div className="text-white">
                    <SignInButton
                    >
                        Sign In
                    </SignInButton>
                </div>
            </SignedOut>
            <SignedIn>
                <div className="flex items-center gap-2 text-white">
                    <UserButton />
                    <div> {user.emailAddresses[0].emailAddress}</div>
                </div>
            </SignedIn>
        </div>
    );
}
