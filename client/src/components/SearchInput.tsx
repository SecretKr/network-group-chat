import { Icon } from "@iconify/react";

export function SearchInput({
  searchQuery,
  setSearchQuery,
  placeholder = "Search",
}: {
  searchQuery: string;
  setSearchQuery: (input: string) => void;
  placeholder?: string;
}) {
  return (
    <span className="mb-4 p-2 flex h-12 bg-white items-center rounded-md gap-2">
      <Icon icon="gg:search" className="size-7 text-gray-400"></Icon>
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border-none focus:outline-none focus:ring-none focus:ring-primary w-full"
      />
      {searchQuery && (
        <Icon
          icon="radix-icons:cross-2"
          className="absolute size-6 text-gray-400 cursor-pointer right-6"
          onClick={() => setSearchQuery("")}
        ></Icon>
      )}
    </span>
  );
}
