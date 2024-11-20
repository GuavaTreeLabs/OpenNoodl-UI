$(document).ready(function () {
    const owner = "GuavaTreeLabs"; // GitHub username
    const repo = "OpenNoodl-UI"; // Repository name
    const folderPath = "packages\noodl-core-ui\src\assets\icons"; // Base folder path in the repository
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`;

    let allFiles = []; // Stores all files for filtering and sorting
    let folderDescriptions = {}; // Stores folder descriptions

    function fetchFiles(url) {
        console.log(`Fetching files from: ${url}`);
        return $.ajax({
            url: url,
            method: "GET",
        })
            .then((data) => {
                const promises = data.map((item) => {
                    if (item.type === "file" && item.name.endsWith(".svg")) {
                        return {
                            name: item.name,
                            path: item.path,
                            download_url: item.download_url,
                        };
                    } else if (item.type === "file" && item.name === "folder.json") {
                        return fetchFolderDescription(item.download_url, item.path);
                    } else if (item.type === "dir") {
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

    function fetchFolderDescription(downloadUrl, path) {
        console.log(`Fetching folder description from: ${downloadUrl}`);
        return fetch(downloadUrl)
            .then((response) => response.json())
            .then((description) => {
                const folderName = path.split("/").slice(-2, -1)[0]; // Extract folder name
                folderDescriptions[folderName] = description;
            })
            .catch((err) => {
                console.error(`Error fetching folder description from ${downloadUrl}:`, err);
            });
    }

    function populateTable(files) {
        const tableBody = $("#file-table-body");
        tableBody.empty(); // Clear existing rows

        files.forEach((file) => {
            const row = `
                <tr>
                    <td><img src="${file.download_url}" width="32" height="32" /></td>
                    <td>${file.path}</td>
                </tr>
            `;
            tableBody.append(row);
        });
    }

    function populateFolderFilter() {
        const filter = $("#folder-filter");
        filter.empty();

        filter.append('<option value="all" selected>All Folders</option>');

        Object.keys(folderDescriptions).forEach((folder) => {
            const description = folderDescriptions[folder];
            filter.append(
                `<option value="${folder}" title="${description}">${folder}</option>`
            );
        });

        // Enable Bootstrap tooltips
        filter.tooltip({
            selector: "option",
        });
    }

    function sortFiles(column, ascending = true) {
        allFiles.sort((a, b) => {
            const valA = a[column].toLowerCase();
            const valB = b[column].toLowerCase();
            if (valA < valB) return ascending ? -1 : 1;
            if (valA > valB) return ascending ? 1 : -1;
            return 0;
        });
        populateTable(allFiles);
    }

    function filterByFolder(folder) {
        if (folder === "all") {
            populateTable(allFiles);
        } else {
            const filteredFiles = allFiles.filter((file) =>
                file.path.includes(`/${folder}/`)
            );
            populateTable(filteredFiles);
        }
    }

    // Event listeners
    $("#folder-filter").on("change", function () {
        const folder = $(this).val();
        filterByFolder(folder);
    });

    $("#filename-column").on("click", function () {
        const ascending = !$(this).data("ascending");
        $(this).data("ascending", ascending);
        sortFiles("path", ascending);
    });

    // Fetch and populate files and folders
    fetchFiles(apiUrl)
        .then((files) => {
            allFiles = files.filter((file) => file.download_url); // Exclude folder.json
            populateTable(allFiles);
            populateFolderFilter();
        })
        .catch((err) => console.error("Error fetching files:", err));
});
