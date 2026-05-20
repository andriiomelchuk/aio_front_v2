


export async function getPopular(language: string) {

    const languageQuery = language === "all" ? "" : `+language:${encodeURIComponent(language)}`;
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const response = await fetch(`https://api.github.com/search/repositories?q=stars:>1${languageQuery}&sort=stars&order=desc&type=Repositories`,
         {
    cache: "no-store"
    })

    console.log(response)

    if(!response.ok) {
        throw new Error('Failed to fetch')
    }

    return response.json()
}

export const checkLanguageExists = async (lang: string) => {
  const response = await fetch(
    `https://api.github.com/search/repositories?q=language:${encodeURIComponent(lang)}&per_page=1`
  );

  if (!response.ok) {
    return false;
  }

  const data = await response.json();

  return data.total_count > 0;
};


/*Github battle*/

// export const getProfile = async (userName: string) => {
    
//     const response = await fetch(`https://api.github.com/users/${userName}`)
//     console.log(response)
//     // return response.data

// }


// const getRepos = (userName: string) => {
//     return fetch(`https://api.github.com/users/${userName}/repos`)
//         .then(repos => repos.data)
//         // .catch(handleError)
// }



// const getUserData = (userName: string) => {
//     return Promise.all([
//         getProfile(userName),
//         getRepos(userName)
//     ])
//         .then(([profile, repos]) => {
//             return {
//                 profile,
//                 score: calculateStore(profile, repos)
//             }
//         })
// }

// const calculateStore = (profile: any, repos: any) => {
//     const followers = profile.followers;
//     const totalStars = getStarCount(repos);
//     return followers + totalStars;
// }

// const getStarCount = (repos: any) => {
//     return repos.reduce((acc: any, repo: any) => acc + repo.stargazers_count, 0)
// }

// const sortPlayers = (players: any) => players.sort((a: any, b: any) => b.score - a.score);

// export const makeBattle = (players: any) => {
//     return Promise.all(players.map(getUserData))
//         .then(sortPlayers)
//         // .catch(handleError)
// }