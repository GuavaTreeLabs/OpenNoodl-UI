$(document).ready(function () {
    // GitHub API details
    const owner = "GuavaTreeLabs"; 
    const repo = "OpenNoodl-UI"; 
    const folderPath = "assets/icons/"; // e.g., interface
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`;

    // Fetch files from GitHub repository
    $.getJSON(apiUrl, function (data) {
        // Loop through each file and add a row to the table
        data.forEach(function (file) {
            if (file.type === "file") { // Ensure it's a file
                // Construct the table row
                const row = `
                    <tr>
                        <td><img src="${file.download_url}" width="16" height="16" /></td>
                        <td class="filename-cell">${file.name}</td>
                    </tr>
                `;
                // Append the row to the table body
                $("#file-table-body").append(row);
            }
        });
    }).fail(function () {
        console.error("Failed to fetch files from GitHub. Please check the repository details.");
    });
});
