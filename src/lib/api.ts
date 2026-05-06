


export async function getPopular(language: string) {

    const languageQuery = language === "all" ? "" : `+language:${encodeURIComponent(language)}`;

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