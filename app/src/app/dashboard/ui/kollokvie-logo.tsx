//For this to work, you need to install @heroicons/react: npm install @heroicons/react
import { PencilSquareIcon } from "@heroicons/react/24/solid";

export default function KollokvieLogo() {
    return (
        <div className="flex items-center text-2xl font-bold">
            <PencilSquareIcon className="w-8 h-8 text-black dark:invert" />
            <p className="ml-2 text-black dark:invert">Kollokvie.no</p>
        </div>
    );
}