$(document).ready(function () {
    const owner = "GuavaTreeLabs"; // GitHub username
    const repo = "OpenNoodl-UI"; // Repository name
    const folderPath = "docs/assets/img/interface"; // Folder path in the repository
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`;

    function fetchFiles(url) {
        return $.ajax({
            url: url,
            method: "GET",
        }).then((data) => {
            const promises = data.map((item) => {
                if (item.type === "file" && item.name.endsWith(".svg")) {
                    return fetchSVGContent(item.download_url).then((svgCode) => ({
                        name: item.name,
                        download_url: item.download_url,
                        svgCode: svgCode,
                    }));
                } else if (item.type === "dir") {
                    // Recursively fetch files in subdirectories
                    return fetchFiles(item.url);
                }
            });
            return Promise.all(promises).then((results) => results.flat()); // Flatten the array of results
        });
    }

    function fetchSVGContent(downloadUrl) {
        const proxyUrl = "https://corsproxy.io/?";
        return fetch(proxyUrl + encodeURIComponent(downloadUrl))
            .then((response) => response.text())
            .catch(() => "Error fetching SVG content");
    }

    function populateTable(files) {
        files.forEach((file, index) => {
            const row = `
                <tr>
                    <td><img src="${file.download_url}" width="32" height="32" /></td>
                    <td>${file.name}</td>
                    <td>
                        <pre id="svg-code-${index}" style="white-space: pre-wrap; max-width: 400px;">${escapeHTML(file.svgCode)}</pre>
                        <button class="btn btn-sm btn-primary copy-btn" data-clipboard-target="#svg-code-${index}">Copy</button>
                    </td>
                </tr>
            `;
            $("#file-table-body").append(row);
        });

        // Initialize clipboard functionality after the rows are added
        initializeClipboard();
    }

    function escapeHTML(html) {
        return html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function initializeClipboard() {
        $(".copy-btn").on("click", function () {
            const targetSelector = $(this).data("clipboard-target");
            const svgCode = $(targetSelector).text();

            // Copy the SVG code to the clipboard
            navigator.clipboard.writeText(svgCode).then(() => {
                alert("SVG code copied to clipboard!");
            }).catch((err) => {
                console.error("Failed to copy text: ", err);
            });
        });
    }

    fetchFiles(apiUrl)
        .then((files) => populateTable(files))
        .catch((err) => console.error("Error fetching files:", err));
});
