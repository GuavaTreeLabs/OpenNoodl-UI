$(document).ready(function () {
    // GitHub API details
    const owner = "YOUR_GITHUB_USERNAME"; // e.g., GuavaTreeLabs
    const repo = "YOUR_REPO_NAME"; // e.g., OpenNoodl-UI
    const folderPath = "YOUR_FOLDER_PATH"; // e.g., interface
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`;

    // Recursive function to fetch files and subfolders
    function fetchFiles(url) {
        return $.getJSON(url).then((data) => {
            const filePromises = data.map((item) => {
                if (item.type === "file") {
                    // Fetch raw SVG code for SVG files
                    return fetchSVGCode(item.download_url).then((svgCode) => ({
                        name: item.name,
                        download_url: item.download_url,
                        svgCode: svgCode,
                    }));
                } else if (item.type === "dir") {
                    // Recursively fetch files in subfolders
                    return fetchFiles(item.url);
                }
            });
            return Promise.all(filePromises).then((results) => results.flat());
        });
    }

    // Fetch the raw SVG code from the file's download URL
function fetchSVGCode(url) {
    if (!url.endsWith(".svg")) {
        return Promise.resolve(""); // Only fetch SVG files
    }
    const proxyUrl = "https://corsproxy.io/?"; // Use a CORS proxy
    return fetch(proxyUrl + encodeURIComponent(url))
        .then((response) => response.text())
        .catch(() => "Error fetching SVG");
}

    // Populate the table with file details
    function populateTable(files) {
        files.forEach((file) => {
            const row = `
                <tr>
                    <td><img src="${file.download_url}" width="16" height="16" /></td>
                    <td>${file.name}</td>
                    <td><pre style="white-space: pre-wrap; max-width: 400px;">${escapeHTML(file.svgCode)}</pre></td>
                </tr>
            `;
            $("#file-table-body").append(row);
        });
    }

    // Escape HTML to safely display SVG code
    function escapeHTML(html) {
        return html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // Fetch files and populate the table
    fetchFiles(apiUrl)
        .then((files) => populateTable(files))
        .catch((err) => console.error("Error fetching files:", err));
});
