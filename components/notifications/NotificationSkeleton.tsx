import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

const renderSkeletons = () => {
  return Array(2)
    .fill(0)
    .map((_, index) => (
      <Card key={index} className="w-full">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ));
};

export default renderSkeletons;
