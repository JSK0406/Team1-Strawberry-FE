import { useQuery } from "react-query";

import network from "../../config/network";

import { DrawingPlay } from "../../entities/DrawingPlay";

import { BaseError } from "../../config/network";

interface UseDrawingPlayQueryProps {
  subEventId: number | undefined;
  eventPlayType: "NORMAL" | "EXPECTATION" | "SHARED" | undefined;
}

export function useDrawingPlayQuery({
  subEventId,
  eventPlayType,
}: UseDrawingPlayQueryProps) {
  const getDrawingInfo = async () => {
    return network.get<DrawingPlay>("lottery/drawing", {
      queryParams: {
        subEventId: subEventId,
        eventPlayType: eventPlayType,
      },
    });
  };

  const query = useQuery<DrawingPlay, BaseError>({
    queryKey: ["drawingInfo"],
    queryFn: getDrawingInfo,
    retry: 0,
    refetchOnWindowFocus: false,
    onError: (err) => {
      console.log(err);
      // alert(err.message);
      // location.href = `${window.location.origin}/drawing`;
    },
  });

  return query;
}
