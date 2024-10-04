<template>
  <div class="pokemon-container">
    <div class="pokemon-list">
      <div
        v-for="pokemon in pokemonList"
        :key="pokemon.name"
        class="pokemon-card"
        @mouseenter="fetchPokemonDetails(pokemon.url)"
        @mouseleave="hideDetails"
      >
        <h2>{{ capitalizeName(pokemon.name) }}</h2>
        <img v-if="pokemon.sprite" :src="pokemon.sprite" :alt="pokemon.name" />
      </div>
    </div>

    <div v-if="pokemonDetails" class="evolution-sidebar" :class="{ 'active': showEvolutions }">
      <h3>{{ capitalizedPokemonName }}</h3>
      <img :src="pokemonDetails.sprites.front_default" alt="Pokemon image" />
      <p>Altura: {{ pokemonDetails.height }}</p>
      <p>Peso: {{ pokemonDetails.weight }}</p>
      <p>Tipo: 
        <span v-for="type in pokemonDetails.types" :key="type.slot">{{ type.type.name }} </span>
      </p>
      <h3>Evoluciones</h3>
      <div class="evolution-card" v-for="evolution in evolutions" :key="evolution.name">
        <h4>{{ evolution.name }}</h4>
        <img :src="evolution.sprite" alt="Evolución del Pokémon" />
        <p>Altura: {{ evolution.height }}</p>
        <p>Peso: {{ evolution.weight }}</p>
      </div>
    </div>

    <div class="pagination">
      <button @click="previousPage" :disabled="!previousPageUrl">Anterior</button>
      <button @click="nextPage" :disabled="!nextPageUrl">Siguiente</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      pokemonList: [],
      pokemonDetails: null,
      evolutions: [],
      showEvolutions: false,
      previousPageUrl: null,
      nextPageUrl: null,
      errorMessage: null,
      limit: 20,
      offset: 0,
    };
  },
  computed: {
    capitalizedPokemonName() {
      if (this.pokemonDetails && this.pokemonDetails.name) {
        return this.pokemonDetails.name.charAt(0).toUpperCase() + this.pokemonDetails.name.slice(1);
      }
      return '';
    }
  },
  methods: {
    async fetchPokemonList(url = `https://pokeapi.co/api/v2/pokemon?limit=${this.limit}&offset=${this.offset}`) {
      try {
        const response = await axios.get(url);
        const pokemonResults = response.data.results;

        const pokemonWithLastEvolution = await Promise.all(
          pokemonResults.map(async (pokemon) => {
            const pokemonData = await axios.get(pokemon.url);
            const speciesResponse = await axios.get(pokemonData.data.species.url);
            const evolutionChainUrl = speciesResponse.data.evolution_chain.url;
            const evolutionResponse = await axios.get(evolutionChainUrl);
            const lastEvolution = this.getLastEvolution(evolutionResponse.data.chain);

            const lastEvolutionData = await axios.get(`https://pokeapi.co/api/v2/pokemon/${lastEvolution}`);
            return {
              name: lastEvolutionData.data.name,
              sprite: lastEvolutionData.data.sprites.front_default,
              url: pokemon.url,
            };
          })
        );

        this.pokemonList = pokemonWithLastEvolution;
        this.previousPageUrl = response.data.previous;
        this.nextPageUrl = response.data.next;
      } catch (error) {
        this.errorMessage = 'Error al cargar la lista de Pokémon.';
      }
    },

    getLastEvolution(chain) {
      let currentEvolution = chain;
      while (currentEvolution.evolves_to.length > 0) {
        currentEvolution = currentEvolution.evolves_to[0];
      }
      return currentEvolution.species.name;
    },

    async fetchPokemonDetails(url) {
      try {
        const response = await axios.get(url);
        this.pokemonDetails = response.data;
        this.showEvolutions = true;
        await this.fetchEvolutionChain();
      } catch (error) {
        this.errorMessage = 'Error al cargar los detalles del Pokémon.';
      }
    },

    hideDetails() {
      this.showEvolutions = false;
      this.pokemonDetails = null;
      this.evolutions = [];
    },

    async fetchEvolutionChain() {
      if (this.pokemonDetails) {
        try {
          const speciesResponse = await axios.get(this.pokemonDetails.species.url);
          const evolutionChainUrl = speciesResponse.data.evolution_chain.url;
          const evolutionResponse = await axios.get(evolutionChainUrl);
          const evolutionChain = evolutionResponse.data.chain;

          this.evolutions = [];
          let currentEvolution = evolutionChain;
          while (currentEvolution) {
            const name = currentEvolution.species.name;
            const evolutionData = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
            this.evolutions.push({
              name: name.charAt(0).toUpperCase() + name.slice(1),
              sprite: evolutionData.data.sprites.front_default,
              height: evolutionData.data.height,
              weight: evolutionData.data.weight,
            });
            currentEvolution = currentEvolution.evolves_to[0];
          }
        } catch (error) {
          this.errorMessage = 'Error al cargar las evoluciones.';
        }
      }
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

    capitalizeName(name) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  },
  mounted() {
    this.fetchPokemonList();
  }
};
</script>

<style scoped>
.pokemon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pokemon-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.pokemon-card {
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 150px;
  text-align: center;
  margin: 10px;
  padding: 10px;
  transition: transform 0.3s;
  cursor: pointer;
}

.pokemon-card:hover {
  transform: scale(1.05);
}

.pokemon-card img {
  max-width: 100px;
}

.error {
  color: red;
  font-weight: bold;
}

.evolution-sidebar {
  position: fixed;
  top: 0;
  right: -300px;
  width: 300px;
  height: 100%;
  background-color: #f0f0f0;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.3);
  padding: 20px;
  transition: right 0.3s ease;
  overflow-y: auto;
}

.evolution-sidebar.active {
  right: 0;
}

.evolution-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px;
  margin: 10px 0;
  text-align: center;
}

.evolution-card img {
  max-width: 100px;
}

.pagination {
  margin-top: 20px;
}

.pagination button {
  margin: 0 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
