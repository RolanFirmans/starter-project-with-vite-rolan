const BASE_URL = 'https://story-api.dicoding.dev/v1';

const registerUser = async (name, email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message);
    }

    return result;
  } catch (error) {
    throw error;
  }
};

const getStories = async () => {
  const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Gagal memuat data stories');
  }

  const data = await response.json();
  return data.listStory;
};



  const loginUser = async (email, password) => {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message);
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

export { loginUser, getStories, registerUser };
