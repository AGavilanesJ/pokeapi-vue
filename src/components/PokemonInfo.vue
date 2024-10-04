<template>
  <div class="pokemon-container">
    <!-- Tarjeta del Pokémon -->
    <div v-if="pokemon" class="pokemon-card" @click="fetchEvolutionChain">
      <h2>{{ capitalizedPokemonName }}</h2>
      <img :src="pokemon.sprites.front_default" alt="Pokemon image" />
      <div class="pokemon-details">
        <p>Altura: {{ pokemon.height }}</p>
        <p>Peso: {{ pokemon.weight }}</p>
        <p>Tipo: 
          <span v-for="type in pokemon.types" :key="type.slot">{{ type.type.name }} </span>
        </p>
      </div>
    </div>

    <div v-else>
      <p>Loading...</p>
    </div>

    <div v-if="errorMessage" class="error">
      <p>{{ errorMessage }}</p>
    </div>

    <input v-model="pokemonId" @keyup.enter="fetchPokemon" placeholder="Numero del Puchamon?" />

    <div v-if="evolutions.length" class="evolution-container">
      <h3>Evoluciones</h3>
      <div class="evolution-card" v-for="evolution in evolutions" :key="evolution.name">
        <h4>{{ evolution.name }}</h4>
        <img :src="evolution.sprite" alt="Evolución del Pokémon" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      pokemon: null,
      pokemonId: 1,
      evolutions: [],
      errorMessage: null,
    };
  },
  computed: {
    capitalizedPokemonName() {
      if (this.pokemon && this.pokemon.name) {
        return this.pokemon.name.charAt(0).toUpperCase() + this.pokemon.name.slice(1);
      }
      return '';
    }
  },
  methods: {
    async fetchPokemon() {
      try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${this.pokemonId}`);
        this.pokemon = response.data;
        this.errorMessage = null;
        this.evolutions = [];
      } catch (error) {
        this.pokemon = null;
        this.errorMessage = 'Y ese puchamon? escriba bien el numero';
      }
    },

    async fetchEvolutionChain() {
      try {
        const speciesResponse = await axios.get(this.pokemon.species.url);
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
          });
          currentEvolution = currentEvolution.evolves_to[0];
        }
      } catch (error) {
        this.errorMessage = 'No se pudieron obtener las evoluciones.';
      }
    }
  },
  mounted() {
    this.fetchPokemon();
  }
};
</script>

<style scoped>
.pokemon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pokemon-card {
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 300px;
  text-align: center;
  margin: 20px;
  padding: 20px;
  transition: transform 0.3s;
  cursor: pointer;
}

.pokemon-card:hover {
  transform: scale(1.05);
}

.pokemon-card img {
  max-width: 150px;
}

.pokemon-details {
  margin-top: 10px;
}

.error {
  color: red;
  font-weight: bold;
}

.evolution-container {
  margin-top: 20px;
}

.evolution-card {
  background-color: #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px;
  margin: 10px;
  text-align: center;
  width: 200px;
}

.evolution-card img {
  max-width: 100px;
}
</style>