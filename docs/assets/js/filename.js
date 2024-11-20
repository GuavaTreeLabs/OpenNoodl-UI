$(document).ready(function () {
    // GitHub API details
    const owner = "GuavaTreeLabs"; // GitHub username
    const repo = "OpenNoodl-UI"; // Repository name
    const folderPath = "docs/assets/img/interface"; // Folder path in the repository
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`;

    // Fetch files from GitHub API
    function fetchFiles(url) {
        return $.ajax({
            url: url,
            method: "GET", // Ensure GET method
        }).then((data) => {
            const promises = data.map((item) => {
                if (item.type === "file" && item.name.endsWith(".svg")) {
                    // Fetch raw SVG content for SVG files
                    return fetchSVGContent(item.download_url).then((svgCode) => ({
                        name: item.name,
                        download_url: item.download_url,
                        svgCode: svgCode,
                    }));
                } else if (item.type === "dir") {
                    // Recursively fetch files in subfolders
                    return fetchFiles(item.url);
                }
            });
            return Promise.all(promises).then((results) => results.flat());
        });
    }

    // Fetch raw SVG code from download URL using a CORS proxy
    function fetchSVGContent(downloadUrl) {
        const proxyUrl = "https://corsproxy.io/?";
        return fetch(proxyUrl + encodeURIComponent(downloadUrl))
            .then((response) => response.text())
            .catch(() => "Error fetching SVG content");
    }

    // Populate the table with file data
    function populateTable(files) {
        files.forEach((file) => {
            const row = `
                <tr>
                    <td><img src="${file.download_url}" width="32" height="32" /></td>
                    <td>${file.name}</td>
                    <td><pre style="white-space: pre-wrap; max-width: 400px;">${escapeHTML(file.svgCode)}</pre></td>
                </tr>
            `;
            $("#file-table-body").append(row);
        });
    }

    // Escape HTML characters to display SVG code safely
    function escapeHTML(html) {
        return html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // Fetch files and populate the table
    fetchFiles(apiUrl)
        .then((files) => populateTable(files))
        .catch((err) => console.error("Error fetching files:", err));
});
