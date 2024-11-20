$(document).ready(function () {
    const owner = "GuavaTreeLabs"; // GitHub username
    const repo = "OpenNoodl-UI"; // Repository name
    const folderPath = "docs/assets/img/interface"; // Folder path in the repository
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`;

    function fetchFiles(url) {
        console.log(`Fetching files from: ${url}`);
        return $.ajax({
            url: url,
            method: "GET",
        })
            .then((data) => {
                const promises = data.map((item) => {
                    if (item.type === "file" && item.name.endsWith(".svg")) {
                        return fetchSVGContent(item.download_url, item.path).then((svgCode) => ({
                            name: item.name,
                            path: item.path,
                            download_url: item.download_url,
                            svgCode: svgCode,
                        }));
                    } else if (item.type === "dir") {
                        console.log(`Recursively fetching from directory: ${item.path}`);
                        return fetchFiles(item.url);
                    }
                });
                return Promise.all(promises).then((results) => results.flat());
            })
            .catch((err) => {
                console.error(`Error fetching files from ${url}:`, err);
                return [];
            });
    }

    function fetchSVGContent(downloadUrl, filePath) {
        const proxyUrl = "https://corsproxy.io/?";
        console.log(`Fetching SVG content from: ${downloadUrl}`);
        return fetch(proxyUrl + encodeURIComponent(downloadUrl))
            .then((response) => {
                if (!response.ok) {
                    console.error(`Failed to fetch SVG: ${filePath}`);
                    return `Error fetching SVG content for ${filePath}`;
                }
                return response.text();
            })
            .catch((err) => {
                console.error(`Error fetching SVG content from ${filePath}:`, err);
                return `Error fetching SVG content for ${filePath}`;
            });
    }

    function populateTable(files) {
        console.log("Populating table with files:", files);
        files.forEach((file, index) => {
            const row = `
                <tr>
                    <td><img src="${file.download_url}" width="32" height="32" /></td>
                    <td>${file.name}</td>
                    <td>${file.path}</td>
                    <td>
                        <pre id="svg-code-${index}" style="white-space: pre-wrap; max-width: 400px;">${escapeHTML(file.svgCode)}</pre>
                        <button class="btn btn-dark link-light float-end copy-btn btn-check" data-clipboard-target="#svg-code-${index}">Copy</button>
                    </td>
                </tr>
            `;

            $("#file-table-body").append(row);
        });

        initializeClipboard();
    }

    function escapeHTML(html) {
        return html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function initializeClipboard() {
        $(".copy-btn").on("click", function () {
            const targetSelector = $(this).data("clipboard-target");
            const svgCode = $(targetSelector).text();

            navigator.clipboard
                .writeText(svgCode)
                .then(() => {
                    alert("SVG code copied to clipboard!");
                })
                .catch((err) => {
                    console.error("Failed to copy text:", err);
                });
        });
    }

    fetchFiles(apiUrl)
        .then((files) => populateTable(files))
        .catch((err) => console.error("Error fetching files:", err));
});
