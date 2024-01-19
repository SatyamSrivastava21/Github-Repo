let reposPerPage = 10;
let githubToken =
  "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";

function searchUser() {
  const usernameInput = document.getElementById("usernameInput");
  const username = usernameInput.value.trim();

  if (username === "") {
    alert("Please enter a GitHub username.");
    return;
  }

  const apiUrl = `https://api.github.com/users/${username}`;

  fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${githubToken}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("User not found");
      }
      return response.json();
    })
    // ...

    .then((userData) => {
      const userInfo = document.getElementById("userInfo");
      userInfo.innerHTML = `
<div class="user-info-container">
<img src="${userData.avatar_url}" alt="${userData.login}" class="avatar">
<div class="user-details">
  <h2>${userData.name || userData.login}</h2>
  <p>${userData.bio || "No bio available"}</p>
</div>
</div>`;

      fetchUserRepos(username, 1);
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
      alert("User not found. Please check the username and try again.");
    });

  // ...
}

function fetchUserRepos(username, page) {
  const apiUrl = `https://api.github.com/users/${username}/repos?page=${page}&per_page=${reposPerPage}`;

  fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${githubToken}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `GitHub API Error: ${response.status} - ${response.statusText}`
        );
      }
      return response.json();
    })
    .then((repos) => {
      const repoList = document.getElementById("repoList");
      repoList.innerHTML = "";

      repos.forEach((repo) => {
        const repoDetails = document.createElement("a");
        repoDetails.className = "repo-details";
        repoDetails.href = repo.html_url;

        const techUsedParagraph = document.createElement("p");
        techUsedParagraph.className = "tech-used";

        repoDetails.innerHTML = `
          <h2>${repo.name}</h2>
          <h4>${repo.description || "No description available"}</h4>`;

        const languagesUrl = repo.languages_url;
        fetch(languagesUrl, {
          headers: {
            Authorization: `Bearer ${githubToken}`,
          },
        })
          .then((response) => response.json())
          .then((languages) => {
            techUsedParagraph.innerHTML = "Tech used: ";
            const languageKeys = Object.keys(languages);
            languageKeys.forEach((language, index) => {
              techUsedParagraph.innerHTML += `<span class="tech-box">${language}</span>`;
              if (index < languageKeys.length - 1) {
                techUsedParagraph.innerHTML += ", ";
              }
            });
            if (languageKeys.length === 0) {
              techUsedParagraph.innerHTML += `<span class="tech-box">Not specified</span>`;
            }

            repoDetails.appendChild(techUsedParagraph);
            repoList.appendChild(repoDetails);
          })
          .catch((error) => {
            console.error("Error fetching languages:", error);
          });
      });

      displayPaginationControls(username, page);
    })
    .catch((error) => {
      console.error("Error fetching repositories:", error);
      alert(
        `Error fetching repositories. Please try again. ${error.message}`
      );
    });
}

function displayPaginationControls(username, currentPage) {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";

  const apiUrl = `https://api.github.com/users/${username}/repos?per_page=${reposPerPage}`;

  fetch(apiUrl, {
    method: "HEAD",
    headers: { Authorization: `Bearer ${githubToken}` },
  })
    .then((response) => {
      const totalCount = parseInt(
        response.headers
          .get("Link")
          .split(",")[1]
          .match(/&page=(\d+)>; rel="last"/)[1]
      );

      const totalPages = Math.ceil(totalCount / reposPerPage);

      const paginationButtonsContainer = document.createElement("div");
      paginationButtonsContainer.className = "pagination-buttons";

      for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.innerText = i;
        pageButton.addEventListener("click", () =>
          fetchUserRepos(username, i)
        );

        if (i === currentPage) {
          pageButton.classList.add("active");
        }

        paginationButtonsContainer.appendChild(pageButton);
      }

      if (currentPage > 1) {
        const previousButton = document.createElement("button");
        previousButton.innerText = "Previous";
        previousButton.addEventListener("click", () =>
          fetchUserRepos(username, currentPage - 1)
        );
        paginationButtonsContainer.insertBefore(
          previousButton,
          paginationButtonsContainer.firstChild
        );
      }

      if (currentPage < totalPages) {
        const nextButton = document.createElement("button");
        nextButton.innerText = "Next";
        nextButton.addEventListener("click", () =>
          fetchUserRepos(username, currentPage + 1)
        );
        paginationButtonsContainer.appendChild(nextButton);
      }

      paginationContainer.appendChild(paginationButtonsContainer);
    })
    .catch((error) => {
      console.error("Error fetching total repositories count:", error);
    });
}

function updateReposPerPage() {
  const reposPerPageSelect =
    document.getElementById("reposPerPageSelect");
  reposPerPage = parseInt(reposPerPageSelect.value, 10);
  searchUser();
}

document
  .getElementById("usernameInput")
  .addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      searchUser();
    }
  });

document
  .getElementById("reposPerPageSelect")
  .addEventListener("change", () => {
    updateReposPerPage();
  });

function filterRepos() {
  const repoSearchInput = document.getElementById("repoSearchInput");
  const filterValue = repoSearchInput.value.toLowerCase();
  const repoList = document.getElementById("repoList");
  const repoDetails = repoList.getElementsByClassName("repo-details");

  Array.from(repoDetails).forEach((repo) => {
    const repoName = repo
      .getElementsByTagName("h2")[0]
      .innerText.toLowerCase();
    const repoDescription = repo
      .getElementsByTagName("h4")[0]
      .innerText.toLowerCase();

    if (
      repoName.includes(filterValue) ||
      repoDescription.includes(filterValue)
    ) {
      repo.style.display = "";
    } else {
      repo.style.display = "none";
    }
  });
}

function clearSearch() {
  const repoSearchInput = document.getElementById("repoSearchInput");
  repoSearchInput.value = "";
  filterRepos();
}