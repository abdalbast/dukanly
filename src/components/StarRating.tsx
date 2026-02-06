import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  count?: number;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  showCount = false,
  count,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < maxRating; i++) {
    if (i < fullStars) {
      stars.push(
        <Star
          key={i}
          className={`${sizeClasses[size]} fill-star text-star`}
        />
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <div key={i} className="relative">
          <Star className={`${sizeClasses[size]} text-star-empty`} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className={`${sizeClasses[size]} fill-star text-star`} />
          </div>
        </div>
      );
    } else {
      stars.push(
        <Star
          key={i}
          className={`${sizeClasses[size]} text-star-empty`}
        />
      );
    }
  }

  return (
    <div className="star-rating">
      {stars}
      {showCount && count !== undefined && (
        <span className="ml-1 text-dense-sm text-info hover:text-primary cursor-pointer hover:underline">
          {count.toLocaleString()}
        </span>
      )}
    </div>
  );
}
