import { Search } from "lucide-react";

export default function Trends() {
  const trends = [
    {
      id: 1,
      tag: "#ReactJS",
      posts: "245K posts",
      category: "Technology Trending Worldwide",
    },
    {
      id: 2,
      tag: "#WebDevelopment",
      posts: "156K posts",
      category: "Technology Trending",
    },
    {
      id: 3,
      tag: "#NextJS",
      posts: "89K posts",
      category: "Technology Trending",
    },
    {
      id: 4,
      tag: "#TailwindCSS",
      posts: "67K posts",
      category: "Technology Trending",
    },
    {
      id: 5,
      tag: "#Programming",
      posts: "432K posts",
      category: "Technology Trending Worldwide",
    },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur border-b border-border p-4 z-10">
        <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2">
          <Search size={20} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Suitter"
            className="bg-transparent flex-1 text-foreground placeholder-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Trends */}
      <div className="p-4">
        <div className="bg-card rounded-2xl overflow-hidden">
          <h3 className="font-bold text-xl p-4 border-b border-border">
            What's happening
          </h3>
          {trends.map((trend) => (
            <button
              key={trend.id}
              className="w-full p-4 hover:bg-muted/50 border-b border-border last:border-b-0 transition-colors text-left"
            >
              <div className="text-xs text-muted-foreground">
                {trend.category}
              </div>
              <div className="text-base font-bold text-foreground">
                {trend.tag}
              </div>
              <div className="text-xs text-muted-foreground">{trend.posts}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
