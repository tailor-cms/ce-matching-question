<template>
  <QuestionContainer
    :data="element.data"
    :is-correct="userState.isCorrect"
    :is-submitted="isSubmitted"
    allowed-retake
    is-graded
    @retry="isSubmitted = false"
    @submit="submit"
  >
    <!-- <div class="text-subtitle-2 mb-2">Select correct answer for each:</div> -->
    <div
      v-for="premise in element.data.premises"
      :key="premise.key"
      class="text-subtitle-2 mt-4"
    >
      <div class="mb-2">
        <span class="font-weight-bold">
          {{ element.data.headings.premise }}:
        </span>
        {{ premise.value }}
      </div>
      <VSelect
        :items="element.data.responses"
        :label="element.data.headings.response"
        :readonly="isSubmitted"
        :rules="[requiredRule]"
        bg-color="white"
        hide-details="auto"
        item-title="value"
        item-value="key"
        variant="outlined"
        @update:model-value="answer[premise.key] = $event"
      >
        <template v-if="isSubmitted" #append-inner>
          <VIcon v-bind="iconProps(premise.key)" />
        </template>
      </VSelect>
    </div>
  </QuestionContainer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { cloneDeep } from 'lodash-es';
import { Element } from '@tailor-cms/ce-matching-question-manifest';
import { QuestionContainer } from '@tailor-cms/lx-components';

const initializeAnswer = () => cloneDeep(props.userState?.response) ?? {};

const props = defineProps<{ element: Element; userState: any }>();
const emit = defineEmits(['interaction']);

const isSubmitted = ref(!!props.userState.isSubmitted);
const answer = ref(initializeAnswer());

const requiredRule = (val: string | boolean | number) => {
  return !!val || 'You have to select an answer.';
};

const submit = () => emit('interaction', { response: answer.value });

const iconProps = (uuid: string) => {
  const { response, correct } = props.userState;
  const isCorrect = response?.[uuid] === correct?.[uuid];
  if (isCorrect) return { icon: 'mdi-check-circle', color: 'success' };
  return { icon: 'mdi-close-circle', color: 'error' };
};

watch(
  () => props.userState,
  (state = {}) => {
    answer.value = initializeAnswer();
    isSubmitted.value = !!state.isSubmitted;
  },
  { deep: true },
);
</script>
