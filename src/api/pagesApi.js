const API_URL = "http://localhost:5000/pages";

export async function getPages() {
    // predefined function fetch that by default sends HTTP GET request to the url
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("Failed to fetch pages");
    }

    // parse JSON data into JS data
    return response.json();
}

export async function createPages(pages) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ pages })
    });

    if (!response.ok) {
        throw new Error("Failed to create pages");
    }

    return response.json();
}

export async function deletePages() {
    const response = await fetch(API_URL, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error("Failed to delete pages");
    }

    return response.json();
}