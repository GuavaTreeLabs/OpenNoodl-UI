        $(document).ready(function () {
            const owner = "GuavaTreeLabs"; // GitHub username
            const repo = "OpenNoodl-UI"; // Repository name
            const folderPath = "packages/noodl-core-ui/src/assets/icons/"; // Folder in the repository
            const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`;

            const token = ""; // Optional: Add your personal access token here for increased rate limits

            function fetchFiles() {
                $.ajax({
                    url: apiUrl,
                    headers: token ? { Authorization: `token ${token}` } : {},
                    success: function (data) {
                        $('#fileDisplay').empty();
                        data.forEach(file => {
                            if (file.type === 'file' && file.name.endsWith('.svg')) {
                                const fileHtml = `
                                    <div class="card mb-3">
                                        <div class="card-body d-flex justify-content-between align-items-center">
                                            <img src="${file.download_url}" alt="${file.name}" style="width: 50px; height: 50px;">
                                            <span>${file.name}</span>
                                            <button class="btn btn-sm btn-primary view-details" data-url="${file.download_url}" data-name="${file.name}">View Details</button>
                                        </div>
                                    </div>`;
                                $('#fileDisplay').append(fileHtml);
                            }
                        });
                    },
                    error: function (error) {
                        alert("Failed to fetch files. Ensure the folder path and repository details are correct.");
                        console.error(error);
                    }
                });
            }

            fetchFiles();

            // Handle View Details button
            $(document).on('click', '.view-details', function () {
                const fileUrl = $(this).data('url');
                const fileName = $(this).data('name');

                $('#svgPreview').attr('src', fileUrl);
                $('#svgDetails').text(`Filename: ${fileName}`);
                $('#fileModal').modal('show');

                $('#copySvgCode').off('click').on('click', function () {
                    fetch(fileUrl)
                        .then(response => response.text())
                        .then(svgCode => {
                            navigator.clipboard.writeText(svgCode).then(() => {
                                alert('SVG code copied to clipboard!');
                            });
                        });
                });
            });
        });