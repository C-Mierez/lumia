import { db } from "@/db";
import { categoriesTable } from "@/db/schema";

const categoryNames = [
    "Music",
    "Comedy",
    "Education",
    "Entertainment",
    "Film & Animation",
    "Gaming",
    "How-to & Style",
    "News & Politics",
    "Nonprofits & Activism",
    "People & Blogs",
    "Pets & Animals",
    "Science & Technology",
    "Sports",
    "Travel & Events",
    "Vehicles",
];

async function main() {
    console.log("Adding categories...");

    try {
        const values = categoryNames.map((name) => ({
            name,
            description: `Videos about ${name.toLowerCase()}`,
        }));

        await db.insert(categoriesTable).values(values);

        console.log("Categories added successfully.");
    } catch (e) {
        console.error("Error adding categories:", e);
        process.exit(1);
    }
}

main();
