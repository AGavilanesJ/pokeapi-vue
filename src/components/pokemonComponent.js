import axios from "axios";

export default {
  data() {
    return {
      pokemonList: [],
      previousPageUrl: null,
      nextPageUrl: null,
      errorMessage: null,
      limit: 20,
      offset: 0,
    };
  },
  methods: {
    async fetchPokemonList(
      url = `https://pokeapi.co/api/v2/pokemon?limit=${this.limit}&offset=${this.offset}`
    ) {
      try {
        const response = await axios.get(url);
        const pokemonResults = response.data.results;

        // Obtener detalles de los Pokémon
        const pokemonWithDetails = await Promise.all(
          pokemonResults.map(async (pokemon) => {
            const pokemonData = await axios.get(pokemon.url);
            return {
              name: pokemonData.data.name,
              sprite: pokemonData.data.sprites.front_default,
              height: pokemonData.data.height,
              weight: pokemonData.data.weight,
              types: pokemonData.data.types,
            };
          })
        );

        this.pokemonList = pokemonWithDetails;
        this.previousPageUrl = response.data.previous;
        this.nextPageUrl = response.data.next;
      } catch (error) {
        this.errorMessage = "Error al cargar la lista de Pokémon.";
      }
    },

    capitalizeName(name) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    },

    async previousPage() {
      if (this.previousPageUrl) {
        await this.fetchPokemonList(this.previousPageUrl);
      }
    },

    async nextPage() {
      if (this.nextPageUrl) {
        await this.fetchPokemonList(this.nextPageUrl);
      }
    },
  },
  mounted() {
    this.fetchPokemonList();
  },
};
