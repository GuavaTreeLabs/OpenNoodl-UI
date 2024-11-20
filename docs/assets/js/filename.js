$(document).ready(function () {
    // GitHub API details
    const owner = "GuavaTreeLabs"; // GitHub username
    const repo = "OpenNoodl-UI"; // Repository name
    const folderPath = "docs/assets/img/interface/"; // Folder containing SVGs
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`;

   function fetchFiles(url) {
        return $.ajax({
            url: url,
            headers: headers
        }).then((data) => {
            const promises = data.map((item) => {
                if (item.type === "file" && item.name.endsWith(".svg")) {
                    // Fetch raw SVG content for SVG files
                   const proxyUrl = "https://corsproxy.io/?"; // Use a public CORS proxy
                    return fetch(proxyUrl + encodeURIComponent(downloadUrl))
                    .then((response) => response.text());

                } else if (item.type === "dir") {
                    // Recursively fetch files in subfolders
                    return fetchFiles(item.url);
                }
            });
            return Promise.all(promises).then((results) => results.flat());
        });
    }

    // Fetch raw SVG code from download URL
    function fetchSVGContent(downloadUrl) {
        return fetch(downloadUrl)
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