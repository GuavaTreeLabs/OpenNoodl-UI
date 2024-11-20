$(document).ready(function () {
    // GitHub API details
    const owner = "GuavaTreeLabs"; // GitHub username
    const repo = "OpenNoodl-UI"; // Repository name
    const folderPath = "docs/assets/img/interface/"; // Folder containing SVGs
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`;

    // Recursive function to fetch files, including subfolders
    function fetchFiles(url) {
        return $.getJSON(url).then((data) => {
            const filePromises = data.map((item) => {
                if (item.type === "file" && item.name.endsWith(".svg")) {
                    // Fetch SVG content for files
                    return fetchSVGContent(item.url).then((svgCode) => ({
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

    // Fetch raw SVG content from GitHub API
    function fetchSVGContent(apiUrl) {
        return $.getJSON(apiUrl).then((data) => {
            // Decode base64 content to get SVG code
            const base64Content = data.content;
            const svgCode = atob(base64Content.replace(/\n/g, ""));
            return svgCode;
        });
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