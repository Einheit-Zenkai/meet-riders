import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
export default function PartyCard() {
    return (<div className="max-w-lg basis-90">
        <Card>
        <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
            <CardAction>Card Action</CardAction>
        </CardHeader>
        <CardContent>
            <p>Card Content</p>
            <Button variant="outline">Button</Button>
        </CardContent>
        
        <CardFooter>
            <p>Card Footer</p>
        </CardFooter>
    </Card>
    </div>);


}