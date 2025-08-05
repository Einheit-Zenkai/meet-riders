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
            <CardTitle>Roll no's Party (or nickname for mutuals)</CardTitle>
            <CardDescription>Number of members: </CardDescription>
            <CardAction></CardAction>
        </CardHeader>
        <CardContent>
            <p>Rough location</p>
            
        </CardContent>
        
        <CardFooter>
            <Button variant="outline">Join Party</Button>
        </CardFooter>
    </Card>
    </div>);


}