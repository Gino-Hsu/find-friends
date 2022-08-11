const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const indexAPI_URL = BASE_URL + '/api/v1/users/'

const userContainer = document.querySelector('#user-container')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const formSelect = document.querySelector('.form-select')
const pagination = document.querySelector('.pagination')

const userList = []
let filterUser = []
const userPerPage = 18

// 產生user card，頭像和名子
function renderFriends(dataList) {
  let HTMLContent = ''
  dataList.forEach((data) => {
    HTMLContent += `
    <div class="card m-4" style="width: 15rem">
      <img class="card-img-top show-user" src="${data.avatar}" alt="Avatar" data-id="${data.id}" data-bs-toggle="modal" data-bs-target="#user-modal">
      <div class="card-body d-flex justify-content-between align-items-center">
        <p class="card-title fs-6 fw-bolder">${data.name}</p>

        <input type="btn" class="btn-check" id="${data.id}">
        <label class="btn btn-outline-danger favorite-btn" for="${data.id}" data-id="${data.id}"><i class="fa-solid fa-heart favorite-btn" data-id="${data.id}"></i></label>
      </div>
    </div>
    `;
  });


  userContainer.innerHTML = HTMLContent;
}


// 產生頁碼
function renderPages(amount) {
  const numberOfPage = Math.ceil(amount / userPerPage)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link num-page" href="#" data-page="${page}">${page}</a></li>`
  }
  pagination.innerHTML = rawHTML
}

// 產生modal裡的內容
function showModal(id) {
  const modalName = document.querySelector(".modal-title");
  const modalAvatar = document.querySelector("#user-modal-image");
  const modalDataList = document.querySelector("#data-list");

  axios.get(indexAPI_URL + id).then(function (response) {
    // handle success
    const userName = response.data.name;
    const userAvatar = response.data.avatar;
    const userSurname = response.data.surname;
    const userEmail = response.data.email;
    const userGender = response.data.gender;
    const userAge = response.data.age;
    const userRegion = response.data.region;
    const userBirthday = response.data.birthday;

    modalName.innerText = `${userName} ${userSurname}`;
    modalAvatar.innerHTML = `
    <img src="${userAvatar}" alt="Avatar" class="img-fuid">
   `;
    modalDataList.innerHTML = `
    <li>Email： ${userEmail}</li>
    <li>Gender： ${userGender}</li>
    <li>Age： ${userAge}</li>
    <li>Region： ${userRegion}</li>
    <li>Birthday： ${userBirthday}</li>
   `;
  });
}

// 收藏功能
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  const favoriteUser = userList.find((user) => user.id === id)

  if (list.some((user) => user.id === id)) {
    return alert('You have added this person to the favorite list!')
  }
  list.push(favoriteUser)
  localStorage.setItem('favoriteUsers', JSON.stringify(list))
  return alert('Successfully added to the favorite list!')
}

// 頁數產生user
function getUserFromPage(page) {
  const data = filterUser.length ? filterUser : userList
  const startIndex = (page - 1) * userPerPage
  return data.slice(startIndex, startIndex + userPerPage)
}

// 搜尋性別功能
function findGender() {
   const gender = formSelect.value
  if (gender === 'male' || gender === 'female') {
    filterUser = filterUser.filter(user =>
      user.gender === gender  
    )
  }
}

// 點擊頁數
pagination.addEventListener('click', function onClickPages(event) {
  if (event.target.tagName !== 'A') return

  const active = document.querySelector('.page-item.active');
  if (active) {
    active.classList.remove('active');
  }

  if (event.target.matches('.num-page')) {
    event.target.parentElement.classList.add('active')
    const page = Number(event.target.dataset.page)
    renderFriends(getUserFromPage(page))
  }
})

// 搜尋功能
// 功能1. submit
searchForm.addEventListener('submit', function onSearchFormSubmit(event) {
  event.preventDefault()
  
  const keyword = searchInput.value.trim().toLowerCase()
  if(!keyword.length) {
    filterUser = userList
    findGender()
    renderPages(filterUser.length)
    return renderFriends(getUserFromPage(1))
  }
  filterUser = userList.filter(user => 
    user.name.toLowerCase().includes(keyword)
  )
  if (filterUser.length === 0) {
    return alert('cant not find:' + keyword)
  }
  findGender()
  renderPages(filterUser.length)
  renderFriends(getUserFromPage(1))
})
// 功能2. 按下 Enter keydown
searchForm.addEventListener('keydown', function onSearchFormSubmit(event) {
  const keyID = event.code
  if(keyID === 'KeyEnter') {
    event.preventDefault()

    const keyword = searchInput.value.trim().toLowerCase()
    if(!keyword.length) {
      filterUser = userList
      findGender()
      renderPages(filterUser.length)
      return renderFriends(getUserFromPage(1))
    }
    filterUser = userList.filter(user => 
      user.name.toLowerCase().includes(keyword)
    )
    if (filterUser.length === 0) {
      return alert('cant not find:' + keyword)
    }
    findGender()
    renderPages(filterUser.length)
    renderFriends(getUserFromPage(1))
  }
})

// 設置監聽器"click"，css選擇器選擇".show-user"指定頭像
userContainer.addEventListener('click', function clickUser(event) {
  if (event.target.matches('.show-user')) {
    showModal(Number(event.target.dataset.id))
  }
  if (event.target.matches('.favorite-btn')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 連接API，並將資料存至 userList 的陣列中
axios
  .get(indexAPI_URL)
  .then(function (response) {
    // handle success
    userList.push(...response.data.results);
    renderPages(userList.length)
    renderFriends(getUserFromPage(1));
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  });
